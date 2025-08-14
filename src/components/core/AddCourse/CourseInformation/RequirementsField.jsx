// import { useEffect, useState } from "react"
// import { useSelector } from "react-redux"

// export default function RequirementsField({
//   name,
//   label,
//   register,
//   setValue,
//   errors,
//   getValues,
// }) {
//   const { editCourse, course } = useSelector((state) => state.course)
//   const [requirement, setRequirement] = useState("")
//   const [requirementsList, setRequirementsList] = useState([])

//   console.log("RequirementsField - editCourse:", editCourse)
//   console.log("RequirementsField - course:", course)
//   console.log("RequirementsField - course.instructions:", course?.instructions)
//   console.log("RequirementsField - requirementsList:", requirementsList)

//   useEffect(() => {
//     if (editCourse && course?.instructions) {
//       console.log("RequirementsField - Setting instructions:", course.instructions)
//       setRequirementsList(course.instructions || [])
//     }
//     register(name, { required: true, validate: (value) => value.length > 0 })
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [editCourse, course?.instructions])

//   useEffect(() => {
//     setValue(name, requirementsList)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [requirementsList])

//   const handleAddRequirement = () => {
//     if (requirement) {
//       setRequirementsList([...requirementsList, requirement])
//       setRequirement("")
//     }
//   }

//   const handleRemoveRequirement = (index) => {
//     const updatedRequirements = [...requirementsList]
//     updatedRequirements.splice(index, 1)
//     setRequirementsList(updatedRequirements)
//   }

//   return (
//     <div className="flex flex-col space-y-2">
//       <label className="text-sm font-semibold text-green-700" htmlFor={name}>
//         {label} <sup className="text-red-500">*</sup>
//       </label>
//       <div className="flex flex-col items-start space-y-2">
//         <input
//           type="text"
//           id={name}
//           value={requirement}
//           onChange={(e) => setRequirement(e.target.value)}
//           placeholder="Enter requirement and click Add"
//           className="w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
//         />
//         <button
//           type="button"
//           onClick={handleAddRequirement}
//           className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
//         >
//           Add
//         </button>
//       </div>
//       {requirementsList.length > 0 && (
//         <ul className="mt-2 list-inside list-disc">
//           {requirementsList.map((requirement, index) => (
//             <li key={index} className="flex items-center text-gray-900 mb-1">
//               <span>{requirement}</span>
//               <button
//                 type="button"
//                 className="ml-2 text-xs text-red-500 hover:text-red-700"
//                 onClick={() => handleRemoveRequirement(index)}
//               >
//                 clear
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}
//       {errors[name] && (
//         <span className="ml-2 text-xs tracking-wide text-red-500">
//           {label} is required
//         </span>
//       )}
//     </div>
//   )
// }


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