import { FaCheck } from "react-icons/fa"
import { useSelector } from "react-redux"
import { ED_TEAL, ED_TEAL_DARK } from "../../../utils/theme"

import CourseBuilderForm from "./CourseBuilder/CourseBuilderForm"
import CourseInformationForm from "./CourseInformation/CourseInformationForm"
import PublishCourse from "./PublishCourse"

export default function RenderSteps() {
  const { step, editCourse } = useSelector((state) => state.course)

  const steps = [
    { id: 1, title: "Course Information" },
    { id: 2, title: "Course Builder" },
    { id: 3, title: "Publish" },
  ]

  const containerStyle = {
    maxWidth: '900px',
    marginTop: '5rem',
    margin: '0 auto',
    marginLeft: '260px',
    padding: '2rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }

  const headingStyle = {
    marginBottom: '2.5rem',
    fontSize: '2rem',
    fontWeight: '700',
    textAlign: 'center',
    color: '#1a202c',
    letterSpacing: '-0.025em'
  }

  const stepperContainerStyle = {
    position: 'relative',
    marginBottom: '3rem',
    display: 'flex',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1rem'
  }

  const stepItemStyle = (isActive, isCompleted) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
    position: 'relative',
    zIndex: 1
  })

  const stepCircleStyle = (isActive, isCompleted) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: isCompleted || isActive ? ED_TEAL : '#e2e8f0',
    color: isCompleted || isActive ? '#ffffff' : '#64748b',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    boxShadow: isActive ? `0 0 0 4px ${ED_TEAL}40` : 'none',
    marginBottom: '0.75rem'
  })

  const stepLabelStyle = (isActive, isCompleted) => ({
    fontSize: '0.875rem',
    fontWeight: isActive || isCompleted ? '600' : '500',
    color: isActive || isCompleted ? ED_TEAL : '#64748b',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  })

  const progressLineStyle = (isCompleted) => ({
    position: 'absolute',
    top: '20px',
    left: 'calc(-50% + 20px)',
    right: 'calc(50% + 20px)',
    height: '2px',
    backgroundColor: isCompleted ? ED_TEAL : '#e2e8f0',
    zIndex: 0,
    transition: 'all 0.3s ease'
  })

  return (
    <div style={containerStyle}>
      <h1 style={headingStyle}>
        {editCourse ? "Edit Course" : "Create New Course"}
      </h1>

      <div style={stepperContainerStyle}>
        {steps.map((item, index) => {
          const isActive = step === item.id
          const isCompleted = step > item.id
          const isFirst = index === 0
          
          return (
            <div 
              key={item.id} 
              style={stepItemStyle(isActive, isCompleted)}
            >
              {!isFirst && (
                <div style={progressLineStyle(isCompleted || isActive)} />
              )}
              <div style={stepCircleStyle(isActive, isCompleted)}>
                {isCompleted ? (
                  <FaCheck size={16} />
                ) : (
                  item.id
                )}
              </div>
              <span style={stepLabelStyle(isActive, isCompleted)}>
                {item.title}
              </span>
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: '2rem' }}>
        {step === 1 && <CourseInformationForm />}
        {step === 2 && <CourseBuilderForm />}
        {step === 3 && <PublishCourse />}
      </div>
    </div>
  )
}
