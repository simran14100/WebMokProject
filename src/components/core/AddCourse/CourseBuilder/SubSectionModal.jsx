// import { useEffect, useState } from "react"
// import { useForm } from "react-hook-form"
// import { toast } from "react-hot-toast"
// import { RxCross2 } from "react-icons/rx"
// import { useDispatch, useSelector } from "react-redux"

// import { createSubSection, updateSubSection } from "../../../../services/operations/courseDetailsAPI";
// import { setCourse } from "../../../../store/slices/courseSlice";

// import Upload from "../Upload";
// import IconBtn from "../../../common/IconBtn";

// export default function SubSectionModal({
//   modalData,
//   setModalData,
//   add = false,
//   view = false,
//   edit = false,
// }) {
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//     getValues,
//   } = useForm()

//   // console.log("view", view)
//   // console.log("edit", edit)
//   // console.log("add", add)

//   const dispatch = useDispatch()
//   const [loading, setLoading] = useState(false)
//   const { token } = useSelector((state) => state.auth)
//   const { course } = useSelector((state) => state.course)

//   useEffect(() => {
//     if (view || edit) {
//       // console.log("modalData", modalData)
//       setValue("lectureTitle", modalData.title)
//       setValue("lectureDesc", modalData.description)
//       setValue("lectureVideo", modalData.videoUrl)
//     }
//   }, [])

//   // detect whether form is updated or not
//   const isFormUpdated = () => {
//     const currentValues = getValues()
//     // console.log("changes after editing form values:", currentValues)
//     if (
//       currentValues.lectureTitle !== modalData.title ||
//       currentValues.lectureDesc !== modalData.description ||
//       currentValues.lectureVideo !== modalData.videoUrl
//     ) {
//       return true
//     }
//     return false
//   }

//   // handle the editing of subsection
//   const handleEditSubsection = async () => {
//     const currentValues = getValues()
//     // console.log("changes after editing form values:", currentValues)
//     const formData = new FormData()
//     // console.log("Values After Editing form values:", currentValues)
//     formData.append("sectionId", modalData.sectionId)
//     formData.append("subSectionId", modalData._id)
//     if (currentValues.lectureTitle !== modalData.title) {
//       formData.append("title", currentValues.lectureTitle)
//     }
//     if (currentValues.lectureDesc !== modalData.description) {
//       formData.append("description", currentValues.lectureDesc)
//     }
//     if (currentValues.lectureVideo !== modalData.videoUrl) {
//       formData.append("video", currentValues.lectureVideo)
//     }
//     setLoading(true)
//     const result = await updateSubSection(formData, token)
//     if (result) {
//       // console.log("result", result)
//       // update the structure of course
//       const updatedCourseContent = course.courseContent.map((section) =>
//         section._id === modalData.sectionId ? result : section
//       )
//       const updatedCourse = { ...course, courseContent: updatedCourseContent }
//       dispatch(setCourse(updatedCourse))
//     }
//     setModalData(null)
//     setLoading(false)
//   }

//   const onSubmit = async (data) => {
//     // console.log(data)
//     if (view) return

//     if (edit) {
//       if (!isFormUpdated()) {
//         toast.error("No changes made to the form")
//       } else {
//         handleEditSubsection()
//       }
//       return
//     }

//     const formData = new FormData()
//     formData.append("sectionId", modalData)
//     formData.append("title", data.lectureTitle)
//     formData.append("description", data.lectureDesc)
//     formData.append("video", data.lectureVideo)
//     setLoading(true)
//     const result = await createSubSection(formData, token)
//     if (result) {
//       // update the structure of course
//       const updatedCourseContent = course.courseContent.map((section) =>
//         section._id === modalData ? result : section
//       )
//       const updatedCourse = { ...course, courseContent: updatedCourseContent }
//       dispatch(setCourse(updatedCourse))
//     }
//     setModalData(null)
//     setLoading(false)
//   }

//   return (
//     <div className="fixed inset-0 z-[1000] !mt-0 grid h-screen w-screen place-items-center overflow-auto bg-white bg-opacity-10 backdrop-blur-sm">
//       <div className="my-10 w-11/12 max-w-[700px] rounded-lg border border-richblack-400 bg-richblack-800">
//         {/* Modal Header */}
//         <div className="flex items-center justify-between rounded-t-lg bg-richblack-700 p-5">
//           <p className="text-xl font-semibold text-richblack-5">
//             {view && "Viewing"} {add && "Adding"} {edit && "Editing"} Lecture
//           </p>
//           <button onClick={() => (!loading ? setModalData(null) : {})}>
//             <RxCross2 className="text-2xl text-richblack-5" />
//           </button>
//         </div>
//         {/* Modal Form */}
//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           className="space-y-8 px-8 py-10"
//         >
//           {/* Lecture Video Upload */}
//           <Upload
//             name="lectureVideo"
//             label="Lecture Video"
//             register={register}
//             setValue={setValue}
//             errors={errors}
//             video={true}
//             viewData={view ? modalData.videoUrl : null}
//             editData={edit ? modalData.videoUrl : null}
//           />
//           {/* Lecture Title */}
//           <div className="flex flex-col space-y-2">
//             <label className="text-sm text-richblack-5" htmlFor="lectureTitle">
//               Lecture Title {!view && <sup className="text-pink-200">*</sup>}
//             </label>
//             <input
//               disabled={view || loading}
//               id="lectureTitle"
//               placeholder="Enter Lecture Title"
//               {...register("lectureTitle", { required: true })}
//               className="form-style w-full bg-richblack-700 rounded-md p-2  text-richblack-25"
//             />
//             {errors.lectureTitle && (
//               <span className="ml-2 text-xs tracking-wide text-pink-200">
//                 Lecture title is required
//               </span>
//             )}
//           </div>
//           {/* Lecture Description */}
//           <div className="flex flex-col space-y-2">
//             <label className="text-sm text-richblack-5" htmlFor="lectureDesc">
//               Lecture Description{" "}
//               {!view && <sup className="text-pink-200">*</sup>}
//             </label>
//             <textarea
//               disabled={view || loading}
//               id="lectureDesc"
//               placeholder="Enter Lecture Description"
//               {...register("lectureDesc", { required: true })}
//               className="form-style resize-x-none min-h-[130px] w-full bg-richblack-700 rounded-md p-2  text-richblack-25"
//             />
//             {errors.lectureDesc && (
//               <span className="ml-2 text-xs tracking-wide text-pink-200">
//                 Lecture Description is required
//               </span>
//             )}
//           </div>
//           {!view && (
//             <div className="flex justify-end">
//               <IconBtn
//                 disabled={loading}
//                 text={loading ? "Loading.." : edit ? "Save Changes" : "Save"}
//               />
//             </div>
//           )}
//         </form>
//       </div>
//     </div>
//   )
// }


// import { useEffect, useState } from "react"
// import { useForm } from "react-hook-form"
// import { toast } from "react-hot-toast"
// import { RxCross2 } from "react-icons/rx"
// import { useDispatch, useSelector } from "react-redux"

// import { createSubSection, updateSubSection } from "../../../../services/operations/courseDetailsAPI"
// import { setCourse } from "../../../../store/slices/courseSlice"

// import Upload from "../Upload"
// import IconBtn from "../../../common/IconBtn"

// // Color constants
// const ED_TEAL = '#07A698';
// const ED_TEAL_DARK = '#059a8c';
// const ED_TEAL_LIGHT = '#E6F7F5';
// const WHITE = '#FFFFFF';
// const GRAY_LIGHT = '#F5F5F5';
// const GRAY_MEDIUM = '#E5E7EB';
// const GRAY_DARK = '#333333';
// const ED_RED = '#EF4444';
// const ED_BLUE = '#3B82F6';

// export default function SubSectionModal({
//   modalData,
//   setModalData,
//   add = false,
//   view = false,
//   edit = false,
// }) {
//   const {
//     register,
//     handleSubmit,
//     setValue,
//     formState: { errors },
//     getValues,
//   } = useForm()

//   const dispatch = useDispatch()
//   const [loading, setLoading] = useState(false)
//   const { token } = useSelector((state) => state.auth)
//   const { course } = useSelector((state) => state.course)

//   useEffect(() => {
//     if (view || edit) {
//       setValue("lectureTitle", modalData.title)
//       setValue("lectureDesc", modalData.description)
//       setValue("lectureVideo", modalData.videoUrl)
//     }
//   }, [view, edit, modalData, setValue])

//   const isFormUpdated = () => {
//     const currentValues = getValues()
//     return (
//       currentValues.lectureTitle !== modalData.title ||
//       currentValues.lectureDesc !== modalData.description ||
//       currentValues.lectureVideo !== modalData.videoUrl
//     )
//   }

//   const handleEditSubsection = async () => {
//     const currentValues = getValues()
//     const formData = new FormData()
    
//     formData.append("sectionId", modalData.sectionId)
//     formData.append("subSectionId", modalData._id)
    
//     if (currentValues.lectureTitle !== modalData.title) {
//       formData.append("title", currentValues.lectureTitle)
//     }
//     if (currentValues.lectureDesc !== modalData.description) {
//       formData.append("description", currentValues.lectureDesc)
//     }
//     if (currentValues.lectureVideo !== modalData.videoUrl) {
//       formData.append("video", currentValues.lectureVideo)
//     }
    
//     setLoading(true)
//     const result = await updateSubSection(formData, token)
//     if (result) {
//       const updatedCourseContent = course.courseContent.map((section) =>
//         section._id === modalData.sectionId ? result : section
//       )
//       dispatch(setCourse({ ...course, courseContent: updatedCourseContent }))
//       toast.success("Lecture updated successfully")
//     }
//     setModalData(null)
//     setLoading(false)
//   }

//   const onSubmit = async (data) => {
//     if (view) return

//     if (edit) {
//       if (!isFormUpdated()) {
//         toast.error("No changes made to the form")
//       } else {
//         await handleEditSubsection()
//       }
//       return
//     }

//     const formData = new FormData()
//     formData.append("sectionId", modalData)
//     formData.append("title", data.lectureTitle)
//     formData.append("description", data.lectureDesc)
//     formData.append("video", data.lectureVideo)
    
//     setLoading(true)
//     const result = await createSubSection(formData, token)
//     if (result) {
//       const updatedCourseContent = course.courseContent.map((section) =>
//         section._id === modalData ? result : section
//       )
//       dispatch(setCourse({ ...course, courseContent: updatedCourseContent }))
//       toast.success("Lecture added successfully")
//     }
//     setModalData(null)
//     setLoading(false)
//   }

//   // Styles
//   const styles = {
//     modalOverlay: {
//       position: 'fixed',
//       inset: 0,
//       zIndex: 50,
//       display: 'flex',
//       alignItems: 'flex-start',
//       justifyContent: 'center',
//       paddingTop: '5rem', // Added padding at the top to account for navbar
//       backgroundColor: 'rgba(0, 0, 0, 0.5)',
//       backdropFilter: 'blur(4px)',
//       padding: '1rem',
      
//     },
//     modalContainer: {
//       width: '100%',
//       maxWidth: '32rem',
//       backgroundColor: WHITE,
//       borderRadius: '0.5rem',
//       boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
//       overflow: 'hidden',
//       // marginTop: '8rem', // Added margin from top
//       marginBottom: '2rem', // Added margin from bottom
//       // maxHeight: '90vh', // Prevent modal from touching screen edges
//       overflowY: 'auto', // Add scroll if content is too long
//       maxHeight: 'calc(90vh - 5rem)', // Account for navbar height
//     },
//     modalHeader: {
//       position: 'relative',
//       padding: '1.5rem',
//       backgroundColor: WHITE,
//       borderBottom: `1px solid ${GRAY_MEDIUM}`,
//     },
//     modalTitle: {
//       fontSize: '1.25rem',
//       fontWeight: 600,
//       color: GRAY_DARK,
//       margin: 0,
//       textAlign: 'center',
//     },
//     closeButton: {
//       position: 'absolute',
//       top: '1rem',
//       right: '1rem',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       width: '2.5rem',
//       height: '2.5rem',
//       borderRadius: '50%',
//       backgroundColor: GRAY_LIGHT,
//       border: 'none',
//       cursor: 'pointer',
//       transition: 'all 0.2s ease',
//       ':hover': {
//         backgroundColor: GRAY_MEDIUM,
//       },
//     },
//     modalBody: {
//       padding: '1.5rem',
//     },
//     formGroup: {
//       marginBottom: '1.5rem',
//     },
//     label: {
//       display: 'block',
//       marginBottom: '0.5rem',
//       fontSize: '0.875rem',
//       fontWeight: 500,
//       color: GRAY_DARK,
//     },
//     requiredStar: {
//       color: ED_RED,
//       marginLeft: '0.25rem',
//     },
//     input: {
//       width: '100%',
//       padding: '0.75rem 1rem',
//       fontSize: '0.875rem',
//       border: `1px solid ${GRAY_MEDIUM}`,
//       borderRadius: '0.375rem',
//       backgroundColor: WHITE,
//       transition: 'all 0.2s ease',
//       ':focus': {
//         outline: 'none',
//         borderColor: ED_TEAL,
//         boxShadow: `0 0 0 3px ${ED_TEAL_LIGHT}`,
//       },
//       ':disabled': {
//         backgroundColor: GRAY_LIGHT,
//         cursor: 'not-allowed',
//       },
//     },
//     textarea: {
//       minHeight: '8rem',
//       resize: 'vertical',
//     },
//     uploadContainer: {
//       border: `2px dashed ${GRAY_MEDIUM}`,
//       borderRadius: '0.375rem',
//       padding: '2rem',
//       textAlign: 'center',
//       backgroundColor: GRAY_LIGHT,
//       marginBottom: '1rem',
//     },
//     uploadInstructions: {
//       color: GRAY_DARK,
//       marginBottom: '0.5rem',
//     },
//     uploadRequirements: {
//       color: GRAY_DARK,
//       fontSize: '0.75rem',
//       marginTop: '1rem',
//     },
//     submitButton: {
//       display: 'inline-flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       padding: '0.75rem 1.5rem',
//       fontSize: '0.875rem',
//       fontWeight: 500,
//       color: WHITE,
//       backgroundColor: ED_TEAL,
//       border: 'none',
//       borderRadius: '0.375rem',
//       cursor: 'pointer',
//       transition: 'all 0.2s ease',
//       ':hover': {
//         backgroundColor: ED_TEAL_DARK,
//       },
//       ':disabled': {
//         opacity: 0.7,
//         cursor: 'not-allowed',
//         backgroundColor: ED_TEAL,
//       },
//     },
//     errorText: {
//       marginTop: '0.25rem',
//       fontSize: '0.75rem',
//       color: ED_RED,
//     },
//   };

//   return (
//     <div style={styles.modalOverlay}>
//     <div style={styles.modalContainer}>
//       {/* Modal Header */}
//       <div style={styles.modalHeader}>
//         <h3 style={styles.modalTitle}>
//           {view && "Viewing Lecture"}
//           {add && "Add New Lecture"}
//           {edit && "Edit Lecture"}
//         </h3>
//         <button 
//           onClick={() => (!loading ? setModalData(null) : {})}
//           style={styles.closeButton}
//           disabled={loading}
//         >
//           <RxCross2 style={{ color: GRAY_DARK, fontSize: '1.25rem' }} />
//         </button>
//       </div>
      
//       {/* Modal Body */}
//       <div style={styles.modalBody}>
//         <form onSubmit={handleSubmit(onSubmit)}>
//           {/* Lecture Video Upload */}
//           <div style={styles.formGroup}>
//             <label style={styles.label}>
//               Lecture Video <span style={styles.requiredStar}>*</span>
//             </label>
//             <div style={styles.uploadContainer}>
//               <Upload
//                 name="lectureVideo"
//                 register={register}
//                 setValue={setValue}
//                 errors={errors}
//                 video={true}
//                 viewData={view ? modalData.videoUrl : null}
//                 editData={edit ? modalData.videoUrl : null}
//                 disabled={view || loading}
//               />
//               <p style={styles.uploadInstructions}>
//                 Drag and drop a video, or click to browse files
//               </p>
//               <div style={styles.uploadRequirements}>
//                 <p>• Aspect ratio 16:9</p>
//                 <p>• Recommended size 1024×576</p>
//               </div>
//             </div>
//           </div>
          
//           {/* Lecture Title */}
//           <div style={styles.formGroup}>
//             <label style={styles.label} htmlFor="lectureTitle">
//               Lecture Title <span style={styles.requiredStar}>*</span>
//             </label>
//             <input
//               disabled={view || loading}
//               id="lectureTitle"
//               placeholder="Enter Lecture Title"
//               {...register("lectureTitle", { required: !view })}
//               style={styles.input}
//             />
//             {errors.lectureTitle && (
//               <p style={styles.errorText}>Lecture title is required</p>
//             )}
//           </div>
          
//           {/* Lecture Description */}
//           <div style={styles.formGroup}>
//             <label style={styles.label} htmlFor="lectureDesc">
//               Lecture Description <span style={styles.requiredStar}>*</span>
//             </label>
//             <textarea
//               disabled={view || loading}
//               id="lectureDesc"
//               placeholder="Enter Lecture Description"
//               {...register("lectureDesc", { required: !view })}
//               style={{ ...styles.input, ...styles.textarea }}
//             />
//             {errors.lectureDesc && (
//               <p style={styles.errorText}>Lecture description is required</p>
//             )}
//           </div>
          
//           {!view && (
//             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
//               <button
//                 type="submit"
//                 style={styles.submitButton}
//                 disabled={loading}
//               >
//                 {loading ? "Processing..." : edit ? "Save Changes" : "Save Lecture"}
//               </button>
//             </div>
//           )}
//         </form>
//       </div>
//     </div>
//   </div>
//   )
// }


import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
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
    
    if (currentValues.lectureTitle !== modalData.title) {
      formData.append("title", currentValues.lectureTitle)
    }
    if (currentValues.lectureDesc !== modalData.description) {
      formData.append("description", currentValues.lectureDesc)
    }
    if (currentValues.lectureVideo !== modalData.videoUrl) {
      formData.append("video", currentValues.lectureVideo)
    }
    
    setLoading(true)
    const result = await updateSubSection(formData, token)
    if (result) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData.sectionId ? result : section
      )
      dispatch(setCourse({ ...course, courseContent: updatedCourseContent }))
      toast.success("Lecture updated successfully")
    }
    setModalData(null)
    setLoading(false)
  }

  const onSubmit = async (data) => {
    if (view) return

    if (edit) {
      if (!isFormUpdated()) {
        toast.error("No changes made to the form")
      } else {
        await handleEditSubsection()
      }
      return
    }

    const formData = new FormData()
    formData.append("sectionId", modalData)
    formData.append("title", data.lectureTitle)
    formData.append("description", data.lectureDesc)
    formData.append("video", data.lectureVideo)
    
    setLoading(true)
    const result = await createSubSection(formData, token)
    if (result) {
      const updatedCourseContent = course.courseContent.map((section) =>
        section._id === modalData ? result : section
      )
      dispatch(setCourse({ ...course, courseContent: updatedCourseContent }))
      toast.success("Lecture added successfully")
    }
    setModalData(null)
    setLoading(false)
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
      marginTop: '2rem',  
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
                  disabled={loading}
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
                  {loading ? "Processing..." : edit ? "Save Changes" : "Save Lecture"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}