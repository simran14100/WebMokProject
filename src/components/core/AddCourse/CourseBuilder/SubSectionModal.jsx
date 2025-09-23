


import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { showSuccess, showError } from "../../../../utils/toast"
import { RxCross2 } from "react-icons/rx"
import { useDispatch, useSelector } from "react-redux"

import { createSubSection, updateSubSection } from "../../../../services/operations/courseDetailsAPI"
import { setCourse } from "../../../../store/slices/courseSlice"

import Upload from "../Upload"
import IconBtn from "../../../common/IconBtn"

// Color constants
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const ED_TEAL_LIGHT = '#E6F7F5';
const WHITE = '#FFFFFF';
const GRAY_LIGHT = '#F5F5F5';
const GRAY_MEDIUM = '#E5E7EB';
const GRAY_DARK = '#333333';
const ED_RED = '#EF4444';
const ED_BLUE = '#3B82F6';

export default function SubSectionModal({
  modalData,
  setModalData,
  add = false,
  view = false,
  edit = false,
}) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    getValues,
  } = useForm()

  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false)
  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)
  const [videoUploading, setVideoUploading] = useState(false)

  useEffect(() => {
    if (view || edit) {
      setValue("lectureTitle", modalData.title)
      setValue("lectureDesc", modalData.description)
      setValue("lectureVideo", modalData.videoUrl)
    }
  }, [view, edit, modalData, setValue])

  const isFormUpdated = () => {
    const currentValues = getValues()
    return (
      currentValues.lectureTitle !== modalData.title ||
      currentValues.lectureDesc !== modalData.description ||
      currentValues.lectureVideo !== modalData.videoUrl
    )
  }

  const handleEditSubsection = async () => {
    const currentValues = getValues()
    const formData = new FormData()
    
    formData.append("sectionId", modalData.sectionId)
    formData.append("subSectionId", modalData._id)
    
    // Always include title and description to ensure they're updated
    formData.append("title", currentValues.lectureTitle?.trim() || modalData.title || "")
    formData.append("description", currentValues.lectureDesc?.trim() || modalData.description || "")
    
    // Handle video file upload if a new file was provided
    if (currentValues.lectureVideo) {
      if (currentValues.lectureVideo instanceof File) {
        formData.append("video", currentValues.lectureVideo)
      } else if (currentValues.lectureVideo?.file) {
        // Handle case where lectureVideo is an object with a file property
        formData.append("video", currentValues.lectureVideo.file)
      } else if (currentValues.lectureVideo?.name) {
        // Handle case where lectureVideo is a File object from the file input
        formData.append("video", currentValues.lectureVideo)
      } else if (currentValues.lectureVideo !== modalData.videoUrl) {
        // If it's a string URL that's different from the current one
        formData.append("videoUrl", currentValues.lectureVideo)
      }
    }
    
    setLoading(true)
    try {
      const result = await updateSubSection(formData, token)
      if (result) {
        const updatedCourseContent = course.courseContent.map((section) =>
          section._id === modalData.sectionId ? result : section
        )
        dispatch(setCourse({ ...course, courseContent: updatedCourseContent }))
        showSuccess("Lecture updated successfully")
        setModalData(null)
      }
    } catch (error) {
      console.error("Error updating subsection:", error)
      showError(error.message || "Failed to update lecture. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    if (view) return

    if (edit) {
      if (!isFormUpdated()) {
        showError("No changes made to the form")
      } else {
        await handleEditSubsection()
      }
      return
    }

    // Validate required fields
    if (!data.lectureTitle?.trim()) {
      showError("Lecture title is required")
      return
    }

    // For subsections, require a finalized Cloudinary URL from the Upload component
    if (!data.lectureVideo || typeof data.lectureVideo !== 'string' || !data.lectureVideo.startsWith('http')) {
      showError('Please upload the video (wait until it finishes) before saving.')
      return
    }

    try {
      setLoading(true)
      const sectionId = typeof modalData === 'string' ? modalData : modalData?.sectionId || modalData?._id
      if (!sectionId) {
        showError('Section ID missing')
        return
      }

      const formData = new FormData()
      formData.append('sectionId', sectionId)
      formData.append('title', data.lectureTitle.trim())
      formData.append('description', data.lectureDesc || '')
      formData.append('videoUrl', data.lectureVideo)

      const result = await createSubSection(formData, token)
      
      if (result) {
        const updatedCourseContent = course.courseContent.map((section) =>
          section._id === sectionId ? result : section
        )
        dispatch(setCourse({ ...course, courseContent: updatedCourseContent }))
        showSuccess("Lecture added successfully")
        setModalData(null)
      }
    } catch (error) {
      console.error("Error in onSubmit:", error)
      showError(error.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fixed styles with proper centering
  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center', // Center vertically
      justifyContent: 'center', // Center horizontally
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      padding: '1rem',
      
      overflowY: 'auto', // Allow scrolling if content is too tall
    },
    modalContainer: {
      width: '100%',
      maxWidth: '42rem', // Increased max width for better content display
      backgroundColor: WHITE,
      borderRadius: '0.75rem',
      marginTop: '16rem',  
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      overflow: 'hidden',
      maxHeight: '90vh', // Prevent modal from being too tall
      display: 'flex',
      flexDirection: 'column',
    },
    modalHeader: {
      position: 'relative',
      padding: '1.5rem 2rem',
      backgroundColor: WHITE,
      borderBottom: `1px solid ${GRAY_MEDIUM}`,
      flexShrink: 0, // Prevent header from shrinking
    },
    modalTitle: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: GRAY_DARK,
      margin: 0,
      textAlign: 'center',
      paddingRight: '3rem', // Account for close button
    },
    closeButton: {
      position: 'absolute',
      top: '1.25rem',
      right: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '2.5rem',
      height: '2.5rem',
      borderRadius: '50%',
      backgroundColor: GRAY_LIGHT,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    modalBody: {
      padding: '2rem',
      overflowY: 'auto', // Allow scrolling within modal body if needed
      flex: 1, // Take remaining space
    },
    formGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      color: GRAY_DARK,
    },
    requiredStar: {
      color: ED_RED,
      marginLeft: '0.25rem',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      fontSize: '0.875rem',
      border: `1px solid ${GRAY_MEDIUM}`,
      borderRadius: '0.5rem',
      backgroundColor: WHITE,
      transition: 'all 0.2s ease',
      outline: 'none',
    },
    inputFocus: {
      borderColor: ED_TEAL,
      boxShadow: `0 0 0 3px ${ED_TEAL_LIGHT}`,
    },
    inputDisabled: {
      backgroundColor: GRAY_LIGHT,
      cursor: 'not-allowed',
      opacity: 0.7,
    },
    textarea: {
      minHeight: '8rem',
      resize: 'vertical',
      fontFamily: 'inherit',
    },
    uploadContainer: {
      border: `2px dashed ${GRAY_MEDIUM}`,
      borderRadius: '0.5rem',
      padding: '2rem',
      textAlign: 'center',
      backgroundColor: GRAY_LIGHT,
      marginBottom: '0.5rem',
      transition: 'all 0.2s ease',
    },
    uploadInstructions: {
      color: GRAY_DARK,
      marginBottom: '0.5rem',
      fontSize: '0.875rem',
    },
    uploadRequirements: {
      color: GRAY_DARK,
      fontSize: '0.75rem',
      marginTop: '1rem',
    },
    submitButtonContainer: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginTop: '2rem',
      paddingTop: '1.5rem',
      borderTop: `1px solid ${GRAY_MEDIUM}`,
    },
    submitButton: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.75rem 2rem',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: WHITE,
      backgroundColor: ED_TEAL,
      border: 'none',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minWidth: '120px',
    },
    submitButtonHover: {
      backgroundColor: ED_TEAL_DARK,
      transform: 'translateY(-1px)',
    },
    submitButtonDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed',
      backgroundColor: ED_TEAL,
      transform: 'none',
    },
    errorText: {
      marginTop: '0.5rem',
      fontSize: '0.75rem',
      color: ED_RED,
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContainer}>
        {/* Modal Header */}
        <div style={styles.modalHeader}>
          <h3 style={styles.modalTitle}>
            {view && "Viewing Lecture"}
            {add && "Add New Lecture"}
            {edit && "Edit Lecture"}
          </h3>
          <button 
            onClick={() => (!loading ? setModalData(null) : {})}
            style={styles.closeButton}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = GRAY_MEDIUM;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = GRAY_LIGHT;
            }}
          >
            <RxCross2 style={{ color: GRAY_DARK, fontSize: '1.25rem' }} />
          </button>
        </div>
        
        {/* Modal Body */}
        <div style={styles.modalBody}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Lecture Video Upload */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Lecture Video {!view && <span style={styles.requiredStar}>*</span>}
              </label>
              <div style={styles.uploadContainer}>
                <Upload
                  name="lectureVideo"
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  video={true}
                  viewData={view ? modalData.videoUrl : null}
                  editData={edit ? modalData.videoUrl : null}
                  disabled={view || loading}
                  useSignedUploads={true}
                  getSignature={async () => {
                    const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
                    const res = await fetch(`${baseUrl}/api/v1/cloudinary/signature`, {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({}),
                      credentials: 'include',
                    });
                    const json = await res.json();
                    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to get signature');
                    return json.data;
                  }}
                  onUploadingChange={(flag) => setVideoUploading(!!flag)}
                />
                <p style={styles.uploadInstructions}>
                  Drag and drop a video file, or click to browse
                </p>
                <div style={styles.uploadRequirements}>
                  <p>• Recommended aspect ratio: 16:9</p>
                  <p>• Optimal size: 1024×576 or higher</p>
                  <p>• Supported formats: MP4, MOV, AVI</p>
                </div>
              </div>
              {errors.lectureVideo && (
                <p style={styles.errorText}>Video file is required</p>
              )}
            </div>
            
            {/* Lecture Title */}
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="lectureTitle">
                Lecture Title {!view && <span style={styles.requiredStar}>*</span>}
              </label>
              <input
                disabled={view || loading}
                id="lectureTitle"
                placeholder="Enter a descriptive title for your lecture"
                {...register("lectureTitle", { required: !view })}
                style={{
                  ...styles.input,
                  ...(view || loading ? styles.inputDisabled : {})
                }}
                onFocus={(e) => {
                  if (!view && !loading) {
                    e.target.style.borderColor = ED_TEAL;
                    e.target.style.boxShadow = `0 0 0 3px ${ED_TEAL_LIGHT}`;
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = GRAY_MEDIUM;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.lectureTitle && (
                <p style={styles.errorText}>Lecture title is required</p>
              )}
            </div>
            
            {/* Lecture Description */}
            <div style={styles.formGroup}>
              <label style={styles.label} htmlFor="lectureDesc">
                Lecture Description {!view && <span style={styles.requiredStar}>*</span>}
              </label>
              <textarea
                disabled={view || loading}
                id="lectureDesc"
                placeholder="Provide a detailed description of what students will learn in this lecture"
                {...register("lectureDesc", { required: !view })}
                style={{
                  ...styles.input,
                  ...styles.textarea,
                  ...(view || loading ? styles.inputDisabled : {})
                }}
                onFocus={(e) => {
                  if (!view && !loading) {
                    e.target.style.borderColor = ED_TEAL;
                    e.target.style.boxShadow = `0 0 0 3px ${ED_TEAL_LIGHT}`;
                  }
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = GRAY_MEDIUM;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.lectureDesc && (
                <p style={styles.errorText}>Lecture description is required</p>
              )}
            </div>
            
            {!view && (
              <div style={styles.submitButtonContainer}>
                <button
                  type="submit"
                  style={{
                    ...styles.submitButton,
                    ...(loading ? styles.submitButtonDisabled : {})
                  }}
                  disabled={loading || videoUploading}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = ED_TEAL_DARK;
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = ED_TEAL;
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {videoUploading ? "Uploading..." : (loading ? "Processing..." : (edit ? "Save Changes" : "Save Lecture"))}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}