// import { useEffect, useRef, useState } from "react"
// import { useDropzone } from "react-dropzone"
// import { FiUploadCloud } from "react-icons/fi"
// import { useSelector } from "react-redux"

// import "video-react/dist/video-react.css"
// import { Player } from "video-react"

// export default function Upload({
//   name,
//   label,
//   register,
//   setValue,
//   errors,
//   video = false,
//   viewData = null,
//   editData = null,
// }) {
//   const { course } = useSelector((state) => state.course)
//   const [selectedFile, setSelectedFile] = useState(null)
//   const [previewSource, setPreviewSource] = useState(
//     viewData ? viewData : editData ? editData : ""
//   )
//   const inputRef = useRef(null)

//   const onDrop = (acceptedFiles) => {
//     const file = acceptedFiles[0]
//     if (file) {
//       previewFile(file)
//       setSelectedFile(file)
//     }
//   }

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     accept: !video
//       ? { "image/*": [".jpeg", ".jpg", ".png"] }
//       : { "video/*": [".mp4"] },
//     onDrop,
//   })

//   const previewFile = (file) => {
//     // console.log(file)
//     const reader = new FileReader()
//     reader.readAsDataURL(file)
//     reader.onloadend = () => {
//       setPreviewSource(reader.result)
//     }
//   }

//   useEffect(() => {
//     register(name, { required: true })
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [register])

//   useEffect(() => {
//     setValue(name, selectedFile)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedFile, setValue])

//   useEffect(() => {
//     if (editData) {
//       setPreviewSource(editData);
//     }
//   }, [editData]);

//   return (
//     <div className="flex flex-col space-y-2">
//       <label className="text-sm font-semibold text-green-700" htmlFor={name}>
//         {label} {!viewData && <sup className="text-red-500">*</sup>}
//       </label>
//       <div
//         className={`${
//           isDragActive ? "bg-green-50 border-green-400" : "bg-white border-gray-300"
//         } flex min-h-[250px] cursor-pointer items-center justify-center rounded-md border-2 border-dotted`}
//       >
//         {previewSource ? (
//           <div className="flex w-full flex-col p-6">
//             {!video ? (
//               <img
//                 src={previewSource}
//                 alt="Preview"
//                 className="h-full w-full rounded-md object-cover"
//               />
//             ) : (
//               <Player aspectRatio="16:9" playsInline src={previewSource} />
//             )}
//             {!viewData && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   setPreviewSource("")
//                   setSelectedFile(null)
//                   setValue(name, null)
//                 }}
//                 className="mt-3 text-red-500 underline hover:text-red-700"
//               >
//                 Cancel
//               </button>
//             )}
//           </div>
//         ) : (
//           <div
//             className="flex w-full flex-col items-center p-6"
//             {...getRootProps()}
//           >
//             <input {...getInputProps()} ref={inputRef} />
//             <div className="grid aspect-square w-14 place-items-center rounded-full bg-green-100">
//               <FiUploadCloud className="text-2xl text-green-600" />
//             </div>
//             <p className="mt-2 max-w-[200px] text-center text-sm text-gray-600">
//               Drag and drop an {!video ? "image" : "video"}, or click to{" "}
//               <span className="font-semibold text-green-600">Browse</span> a
//               file
//             </p>
//             {/* Add a separate browse button for better UX */}
//             <button
//               type="button"
//               onClick={(e) => {
//                 e.stopPropagation();
//                 inputRef.current?.click();
//               }}
//               className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
//             >
//               Browse Files
//             </button>
//             <ul className="mt-10 flex list-disc justify-between space-x-12 text-center  text-xs text-gray-500">
//               <li>Aspect ratio 16:9</li>
//               <li>Recommended size 1024x576</li>
//             </ul>
//           </div>
//         )}
//       </div>
//       {errors[name] && (
//         <span className="ml-2 text-xs tracking-wide text-red-500">
//           {label} is required
//         </span>
//       )}
//     </div>
//   )
// }

import { useEffect, useRef, useState } from "react"
import { useDropzone } from "react-dropzone"
import { FiUploadCloud } from "react-icons/fi"
import { useSelector } from "react-redux"
import "video-react/dist/video-react.css"
import { Player } from "video-react"


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
}) {
  const { course } = useSelector((state) => state.course)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewSource, setPreviewSource] = useState(
    viewData ? viewData : editData ? editData : ""
  )
  const inputRef = useRef(null)

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      previewFile(file)
      setSelectedFile(file)
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
    register(name, { required: true })
  }, [register, name])

  useEffect(() => {
    setValue(name, selectedFile)
  }, [selectedFile, setValue, name])

  useEffect(() => {
    if (editData) {
      setPreviewSource(editData)
    }
  }, [editData])

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
                <Player aspectRatio="16:9" playsInline src={previewSource} />
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
              Drag and drop an {!video ? "image" : "video"}, or{' '}
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
            >
              Browse Files
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