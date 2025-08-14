


import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { ED_TEAL, ED_TEAL_DARK } from "../../../../utils/theme"

export default function RequirementsField({
  name,
  label,
  register,
  setValue,
  errors,
  getValues,
}) {
  const { editCourse, course } = useSelector((state) => state.course)
  const [requirement, setRequirement] = useState("")
  const [requirementsList, setRequirementsList] = useState([])

  useEffect(() => {
    if (editCourse && course?.instructions) {
      setRequirementsList(course.instructions || [])
    }
    register(name, { required: true, validate: (value) => value.length > 0 })
  }, [editCourse, course?.instructions, name, register])

  useEffect(() => {
    setValue(name, requirementsList)
  }, [requirementsList, name, setValue])

  const handleAddRequirement = () => {
    if (requirement) {
      setRequirementsList([...requirementsList, requirement])
      setRequirement("")
    }
  }

  const handleRemoveRequirement = (index) => {
    const updatedRequirements = [...requirementsList]
    updatedRequirements.splice(index, 1)
    setRequirementsList(updatedRequirements)
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
        {label} <span style={{ color: '#e53e3e' }}>*</span>
      </label>
      
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          width: '100%'
        }}>
          <input
            type="text"
            id={name}
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="Enter requirement and click Add"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              fontSize: '0.875rem',
              border: `1px solid ${errors[name] ? '#e53e3e' : '#e2e8f0'}`,
              borderRadius: '8px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxShadow: errors[name] ? '0 0 0 3px rgba(229, 62, 62, 0.1)' : 'none',
              ':focus': {
                borderColor: ED_TEAL,
                boxShadow: `0 0 0 3px ${ED_TEAL}20`
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddRequirement}
            style={{
              padding: '0.75rem 1.25rem',
              backgroundColor: ED_TEAL,
              color: 'white',
              fontWeight: 500,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              ':hover': {
                backgroundColor: ED_TEAL_DARK
              }
            }}
          >
            Add
          </button>
        </div>
        
        {requirementsList.length > 0 && (
          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            backgroundColor: '#f8fafc',
            borderRadius: '8px',
            padding: '0.75rem',
            border: '1px solid #edf2f7'
          }}>
            {requirementsList.map((requirement, index) => (
              <li 
                key={index} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <span style={{ color: '#1a202c' }}>{requirement}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRequirement(index)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      backgroundColor: '#fecaca'
                    }
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
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