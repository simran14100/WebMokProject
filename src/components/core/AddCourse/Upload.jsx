


import { useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FiUploadCloud } from "react-icons/fi"
import { useSelector } from "react-redux"
// Replaced video-react Player (legacy context) with native HTML5 video for preview


const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';

export default function Upload({
  name,
  label,
  register,
  setValue,
  errors,
  video = false,
  viewData = null,
  editData = null,
  required = true,
  // Signed Cloudinary direct upload
  useSignedUploads = false,
  cloudName,
  uploadPreset,
  folder,
  getSignature,
  onUploadingChange,
}) {
  const { course } = useSelector((state) => state.course)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(
    viewData ? viewData : editData ? editData : ""
  )
  const inputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      previewFile(file)
      if (useSignedUploads) {
        uploadToCloudinary(file)
      } else {
      setSelectedFile(file)
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: !video
      ? { "image/*": [".jpeg", ".jpg", ".png"] }
      : { "video/*": [".mp4"] },
    onDrop,
  })

  const previewFile = (file) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = () => {
      setPreviewSource(reader.result)
    }
  }

  useEffect(() => {
    register(name, { required })
  }, [register, name, required])

  useEffect(() => {
    if (!useSignedUploads) {
    setValue(name, selectedFile)
    }
  }, [selectedFile, setValue, name])

  useEffect(() => {
    if (editData) {
      setPreviewSource(editData)
    }
  }, [editData])

  const uploadToCloudinary = async (file) => {
    try {
      // Always rely on server-provided signature/config
      if (typeof getSignature !== 'function') {
        console.error('getSignature function is required for signed uploads')
        return
      }
      setIsUploading(true)
      if (typeof onUploadingChange === 'function') {
        try { onUploadingChange(true) } catch {}
      }

      const sig = await getSignature()
      console.log('[Upload] Signature payload:', sig)
      if (!sig || !sig.signature || !sig.timestamp || !sig.apiKey) {
        console.error('Invalid signature payload from backend')
        setIsUploading(false)
        return
      }

      const formData = new FormData()
      formData.append('file', file)
      if (sig.uploadPreset) formData.append('upload_preset', sig.uploadPreset)
      // Always use server-enforced folder from signature
      if (sig.folder) formData.append('folder', sig.folder)
      formData.append('api_key', sig.apiKey)
      formData.append('timestamp', sig.timestamp)
      formData.append('signature', sig.signature)

      const resourceType = video ? 'video' : 'image'
      const effectiveCloudNameFromServer = sig.cloudName || cloudName || process.env.REACT_APP_CLOUDINARY_CLOUD_NAME
      const endpoint = `https://api.cloudinary.com/v1_1/${effectiveCloudNameFromServer}/${resourceType}/upload`
      console.log('[Upload] Posting to:', endpoint)
      console.log('[Upload] Final params:', {
        upload_preset: formData.get('upload_preset'),
        folder: formData.get('folder'),
        api_key: formData.get('api_key'),
        timestamp: formData.get('timestamp')
      })
      const res = await fetch(endpoint, { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok || !json.secure_url) {
        const errMsg = json?.error?.message || 'Unknown Cloudinary error'
        console.error('Cloudinary upload failed:', errMsg, json)
        setIsUploading(false)
        return
      }
      setPreviewSource(json.secure_url)
      setValue(name, json.secure_url)
      setSelectedFile(null)
    } catch (e) {
      console.error('Signed upload error:', e)
    } finally {
      setIsUploading(false)
      if (typeof onUploadingChange === 'function') {
        try { onUploadingChange(false) } catch {}
      }
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
      marginBottom: '1.5rem'
    }}>
      <label style={{
        fontSize: '0.875rem',
        fontWeight: 600,
        color: ED_TEAL,
        marginBottom: '0.25rem'
      }} htmlFor={name}>
        {label} {!viewData && <span style={{ color: '#e53e3e' }}>*</span>}
      </label>
      
      <div
        style={{
          minHeight: '250px',
          borderRadius: '8px',
          border: `2px dashed ${isDragActive ? ED_TEAL : '#e2e8f0'}`,
          backgroundColor: isDragActive ? `${ED_TEAL}10` : '#ffffff',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          overflow: 'hidden'
        }}
      >
        {previewSource ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            padding: '1.5rem'
          }}>
            {!video ? (
              <img
                src={previewSource}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
            ) : (
              <div style={{ width: '100%' }}>
                <video
                  src={previewSource}
                  controls
                  style={{ width: '100%', borderRadius: '4px' }}
                />
              </div>
            )}
            {!viewData && (
              <button
                type="button"
                onClick={() => {
                  setPreviewSource("")
                  setSelectedFile(null)
                  setValue(name, null)
                }}
                style={{
                  marginTop: '1rem',
                  color: '#e53e3e',
                  textDecoration: 'underline',
                  fontSize: '0.875rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  ':hover': {
                    color: '#c53030'
                  }
                }}
              >
                Remove
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              padding: '1.5rem',
              textAlign: 'center'
            }}
            {...getRootProps()}
          >
            <input {...getInputProps()} ref={inputRef} />
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: `${ED_TEAL}20`,
              display: 'grid',
              placeItems: 'center',
              marginBottom: '1rem'
            }}>
              <FiUploadCloud style={{
                fontSize: '1.5rem',
                color: ED_TEAL
              }} />
            </div>
            <p style={{
              margin: '0.5rem 0',
              fontSize: '0.875rem',
              color: '#4a5568',
              maxWidth: '250px'
            }}>
              {isUploading ? 'Uploading...' : `Drag and drop an ${!video ? 'image' : 'video'}, or`} {' '}
              <span style={{
                fontWeight: 600,
                color: ED_TEAL,
                cursor: 'pointer'
              }}>browse</span> a file
            </p>
            
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1.25rem',
                backgroundColor: ED_TEAL,
                color: 'white',
                fontWeight: 500,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: ED_TEAL_DARK
                }
              }}
            disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Browse Files'}
            </button>
            
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginTop: '1.5rem',
              fontSize: '0.75rem',
              color: '#718096'
            }}>
              <span>Aspect ratio 16:9</span>
              <span>Recommended size 1024x576</span>
            </div>
          </div>
        )}
      </div>
      
      {errors[name] && (
        <span style={{
          fontSize: '0.75rem',
          color: '#e53e3e',
          marginTop: '0.25rem'
        }}>
          {label} is required
        </span>
      )}
    </div>
  )
}