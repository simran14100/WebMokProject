


import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { FiEye, FiEyeOff, FiCheck, FiArrowLeft, FiSave } from "react-icons/fi"

import { editCourseDetails } from "../../../../services/operations/courseDetailsAPI"
import { resetCourseState, setStep } from "../../../../store/slices/courseSlice"
import { COURSE_STATUS } from "../../../../utils/constants"
import IconBtn from "../../../common/IconBtn"

// Color constants
const ED_TEAL = '#07A698'
const ED_TEAL_DARK = '#059a8c'
const ED_TEAL_LIGHT = '#E6F7F5'
const ED_TEAL_LIGHTER = '#F0FDFC'
const WHITE = '#FFFFFF'
const GRAY_50 = '#F9FAFB'
const GRAY_100 = '#F3F4F6'
const GRAY_200 = '#E5E7EB'
const GRAY_300 = '#D1D5DB'
const GRAY_400 = '#9CA3AF'
const GRAY_500 = '#6B7280'
const GRAY_600 = '#4B5563'
const GRAY_700 = '#374151'
const GRAY_800 = '#1F2937'
const GRAY_900 = '#111827'

export default function PublishCourse() {
  const { register, handleSubmit, setValue, getValues, watch } = useForm()
  
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state) => state.auth)
  const { course } = useSelector((state) => state.course)
  const { user } = useSelector((state) => state.profile)
  const [loading, setLoading] = useState(false)
  
  // Watch the public checkbox value for dynamic styling
  const isPublic = watch("public", false)

  useEffect(() => {
    if (course?.status === COURSE_STATUS.PUBLISHED) {
      setValue("public", true)
    }
  }, [course, setValue])

  const goBack = () => {
    dispatch(setStep(2))
  }

  // const goToCourses = () => {
  //   dispatch(resetCourseState())
  //   const target = user?.accountType === 'Admin' ? "/admin/course/allCourses" : "/instructor/my-courses"
  //   navigate(target)
  // }

  const goToCourses = () => {
  dispatch(resetCourseState())
  navigate("/admin/course/allCourses")
}

  const handleCoursePublish = async () => {
    // Check if form has been updated or not
    if (
      (course?.status === COURSE_STATUS.PUBLISHED &&
        getValues("public") === true) ||
      (course?.status === COURSE_STATUS.DRAFT && getValues("public") === false)
    ) {
      // Form has not been updated - no need to make API call
      goToCourses()
      return
    }
    
    const formData = new FormData()
    formData.append("courseId", course._id)
    const courseStatus = getValues("public")
      ? COURSE_STATUS.PUBLISHED
      : COURSE_STATUS.DRAFT
    formData.append("status", courseStatus)
    
    setLoading(true)
    const result = await editCourseDetails(formData, token)
    if (result) {
      goToCourses()
    }
    setLoading(false)
  }

  const onSubmit = (data) => {
    handleCoursePublish()
  }

  const styles = {
    container: {
      backgroundColor: WHITE,
      borderRadius: '12px',
      border: `1px solid ${GRAY_200}`,
      padding: '32px',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      maxWidth: '600px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '32px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 700,
      color: GRAY_900,
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    subtitle: {
      fontSize: '16px',
      color: GRAY_600,
      marginTop: '8px',
      lineHeight: '1.5',
    },
    checkboxContainer: {
      marginBottom: '40px',
    },
    checkboxWrapper: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      padding: '20px',
      backgroundColor: isPublic ? ED_TEAL_LIGHTER : GRAY_50,
      border: `2px solid ${isPublic ? ED_TEAL_LIGHT : GRAY_200}`,
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    checkboxInput: {
      width: '20px',
      height: '20px',
      accentColor: ED_TEAL,
      cursor: 'pointer',
      marginTop: '2px',
    },
    checkboxContent: {
      flex: 1,
    },
    checkboxLabel: {
      fontSize: '18px',
      fontWeight: 600,
      color: GRAY_900,
      marginBottom: '8px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    checkboxDescription: {
      fontSize: '14px',
      color: GRAY_600,
      lineHeight: '1.5',
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: 500,
      marginTop: '12px',
    },
    publishedBadge: {
      backgroundColor: ED_TEAL_LIGHT,
      color: ED_TEAL_DARK,
    },
    draftBadge: {
      backgroundColor: GRAY_200,
      color: GRAY_700,
    },
    buttonContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: '32px',
      borderTop: `1px solid ${GRAY_200}`,
    },
    backButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      backgroundColor: GRAY_100,
      color: GRAY_700,
      border: `1px solid ${GRAY_300}`,
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 500,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
    },
    backButtonHover: {
      backgroundColor: GRAY_200,
      borderColor: GRAY_400,
    },
    saveButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 32px',
      backgroundColor: ED_TEAL,
      color: WHITE,
      border: 'none',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      minWidth: '160px',
      justifyContent: 'center',
    },
    saveButtonHover: {
      backgroundColor: ED_TEAL_DARK,
      transform: 'translateY(-1px)',
    },
    saveButtonDisabled: {
      opacity: 0.7,
      cursor: 'not-allowed',
      backgroundColor: ED_TEAL,
      transform: 'none',
    },
    icon: {
      fontSize: '20px',
    },
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <FiEye style={{ color: ED_TEAL }} />
          Publish Settings
        </h2>
        <p style={styles.subtitle}>
          Control the visibility and availability of your course to students. 
          You can change these settings at any time.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={styles.checkboxContainer}>
          <div 
            style={styles.checkboxWrapper}
            onClick={() => setValue("public", !getValues("public"))}
          >
            <input
              type="checkbox"
              id="public"
              {...register("public")}
              style={styles.checkboxInput}
            />
            <div style={styles.checkboxContent}>
              <label htmlFor="public" style={styles.checkboxLabel}>
                {isPublic ? <FiEye /> : <FiEyeOff />}
                Make this course public
              </label>
              <p style={styles.checkboxDescription}>
                {isPublic 
                  ? "Your course will be visible to all students and can be enrolled by anyone. It will appear in course listings and search results."
                  : "Your course will remain private and won't be visible to students. Only you can access it from your instructor dashboard."
                }
              </p>
              
              <div style={{
                ...styles.statusBadge,
                ...(isPublic ? styles.publishedBadge : styles.draftBadge)
              }}>
                <FiCheck />
                {isPublic ? 'Published' : 'Draft'}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.buttonContainer}>
          <button
            type="button"
            onClick={goBack}
            disabled={loading}
            style={{
              ...styles.backButton,
              ...(loading ? { opacity: 0.7, cursor: 'not-allowed' } : {})
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                Object.assign(e.target.style, styles.backButtonHover)
              }
            }}
            onMouseLeave={(e) => {
              Object.assign(e.target.style, styles.backButton)
            }}
          >
            <FiArrowLeft />
            Back
          </button>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.saveButton,
              ...(loading ? styles.saveButtonDisabled : {})
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                Object.assign(e.target.style, styles.saveButtonHover)
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                Object.assign(e.target.style, styles.saveButton)
              }
            }}
          >
            <FiSave />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}