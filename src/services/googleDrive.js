let identityScriptPromise
let tokenClient
let pendingTokenRequest

export function loadGoogleIdentity() {
  if (globalThis.google?.accounts?.oauth2) return Promise.resolve()
  if (identityScriptPromise) return identityScriptPromise

  identityScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (globalThis.google?.accounts?.oauth2) resolve()
      else reject(new Error('Google authentication could not be initialized.'))
    }
    script.onerror = () => reject(new Error('Google authentication could not be loaded. Check your internet connection.'))
    document.head.append(script)
  }).catch(error => {
    identityScriptPromise = null
    throw error
  })

  return identityScriptPromise
}

function getDriveConfig() {
  const config = {
    apiKey: import.meta.env.VITE_DRIVE_API_KEY,
    clientId: import.meta.env.VITE_OAUTH_CLIENT_ID,
    folderId: import.meta.env.VITE_DRIVE_FOLDER_ID_LESSON,
  }

  if (!config.apiKey || !config.clientId || !config.folderId) {
    throw new Error('Google Drive upload is not configured. Check the lesson Drive environment settings.')
  }

  return config
}

function requestDriveAccessToken(clientId) {
  if (!globalThis.google?.accounts?.oauth2) {
    return Promise.reject(new Error('Google authentication is not ready. Please try again.'))
  }

  return new Promise((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = globalThis.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: response => {
          const request = pendingTokenRequest
          pendingTokenRequest = null
          if (!request) return
          if (response.error) {
            request.reject(new Error(response.error_description || 'Google Drive authorization was denied.'))
          } else {
            request.resolve(response.access_token)
          }
        },
        error_callback: error => {
          const request = pendingTokenRequest
          pendingTokenRequest = null
          request?.reject(new Error(error.message || 'Google Drive authorization was interrupted.'))
        },
      })
    }

    if (pendingTokenRequest) {
      reject(new Error('A Google Drive authorization request is already in progress.'))
      return
    }

    pendingTokenRequest = { resolve, reject }
    try {
      tokenClient.requestAccessToken({ prompt: '' })
    } catch (error) {
      pendingTokenRequest = null
      reject(new Error(error.message || 'Google Drive authorization could not be started.'))
    }
  })
}

async function responseError(response, fallback) {
  try {
    const data = await response.json()
    return new Error(data.error?.message || fallback)
  } catch {
    return new Error(fallback)
  }
}

function uploadFileContent(uploadUrl, file, accessToken, onProgress) {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    request.open('PUT', uploadUrl)
    request.setRequestHeader('Authorization', `Bearer ${accessToken}`)
    request.setRequestHeader('Content-Type', file.type)
    request.upload.onprogress = event => {
      if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100))
    }
    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        let message = `Google Drive upload failed (${request.status}).`
        try {
          message = JSON.parse(request.responseText).error?.message || message
        } catch {
          // Keep the explicit HTTP error when Drive returns a non-JSON response.
        }
        reject(new Error(message))
        return
      }

      try {
        resolve(JSON.parse(request.responseText))
      } catch {
        reject(new Error('Google Drive did not return the uploaded file details.'))
      }
    }
    request.onerror = () => reject(new Error('The file could not be uploaded. Check your internet connection.'))
    request.onabort = () => reject(new Error('The file upload was cancelled.'))
    request.send(file)
  })
}

async function deleteDriveFile(fileId, apiKey, accessToken) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?supportsAllDrives=true&key=${encodeURIComponent(apiKey)}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${accessToken}` } },
  )
  if (!response.ok) throw await responseError(response, 'Google Drive could not remove the incomplete upload.')
}

async function makeFilePublic(fileId, apiKey, accessToken) {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions?supportsAllDrives=true&key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    },
  )
  if (!response.ok) throw await responseError(response, 'Google Drive could not enable link viewing for this file.')
}

export async function uploadLessonMedia(file, onProgress) {
  const config = getDriveConfig()
  const accessToken = await requestDriveAccessToken(config.clientId)
  const metadata = {
    name: file.name,
    mimeType: file.type,
    parents: [config.folderId],
  }
  const response = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&fields=id&key=${encodeURIComponent(config.apiKey)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Upload-Content-Type': file.type,
        'X-Upload-Content-Length': String(file.size),
      },
      body: JSON.stringify(metadata),
    },
  )

  if (!response.ok) throw await responseError(response, 'Google Drive could not start the file upload.')
  const uploadUrl = response.headers.get('Location')
  if (!uploadUrl) throw new Error('Google Drive did not provide an upload location.')

  const uploadedFile = await uploadFileContent(uploadUrl, file, accessToken, onProgress)
  if (!uploadedFile.id) throw new Error('Google Drive did not return an uploaded file ID.')

  try {
    await makeFilePublic(uploadedFile.id, config.apiKey, accessToken)
  } catch (error) {
    try {
      await deleteDriveFile(uploadedFile.id, config.apiKey, accessToken)
    } catch (cleanupError) {
      throw new Error(
        `${error.message} The incomplete upload could not be removed from Google Drive: ${cleanupError.message}`,
        { cause: cleanupError },
      )
    }
    throw error
  }

  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(uploadedFile.id)}`
}
