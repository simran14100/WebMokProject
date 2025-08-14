// // Importing React hook for managing component state
// import { useEffect, useState } from "react"
// // Importing React icon component
// import { MdClose } from "react-icons/md"
// import { useSelector } from "react-redux"

// // Defining a functional component ChipInput
// export default function ChipInput({
//   // Props to be passed to the component
//   label,
//   name,
//   placeholder,
//   register,
//   errors,
//   setValue,
//   getValues,
// }) {
//   const { editCourse, course } = useSelector((state) => state.course)

//   // Setting up state for managing chips array
//   const [chips, setChips] = useState([])

//   useEffect(() => {
//     if (editCourse) {
//       // console.log(course)
//       setChips(course?.tag || [])
//     }
//     register(name, { required: true, validate: (value) => value.length > 0 })
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [])

//   useEffect(() => {
//     setValue(name, chips)
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [chips])

//   // Function to handle user input when chips are added
//   const handleKeyDown = (event) => {
//     // Check if user presses "Enter" or ","
//     if (event.key === "Enter" || event.key === ",") {
//       // Prevent the default behavior of the event
//       event.preventDefault()
//       // Get the input value and remove any leading/trailing spaces
//       const chipValue = event.target.value.trim()
//       // Check if the input value exists and is not already in the chips array
//       if (chipValue && !chips.includes(chipValue)) {
//         // Add the chip to the array and clear the input
//         const newChips = [...chips, chipValue]
//         setChips(newChips)
//         event.target.value = ""
//       }
//     }
//   }

//   // Function to handle deletion of a chip
//   const handleDeleteChip = (chipIndex) => {
//     // Filter the chips array to remove the chip with the given index
//     const newChips = chips.filter((_, index) => index !== chipIndex)
//     setChips(newChips)
//   }

//   // Render the component
//   return (
//     <div className="flex flex-col space-y-2">
//       {/* Render the label for the input */}
//       <label className="text-sm font-semibold text-green-700" htmlFor={name}>
//         {label} <sup className="text-red-500">*</sup>
//       </label>
//       {/* Render the chips and input */}
//       <div className="flex w-full flex-wrap gap-y-2">
//         {/* Map over the chips array and render each chip */}
//         {chips.map((chip, index) => (
//           <div
//             key={index}
//             className="m-1 flex items-center rounded-full bg-green-100 px-2 py-1 text-sm text-green-800 border border-green-300"
//           >
//             {/* Render the chip value */}
//             {chip}
//             {/* Render the button to delete the chip */}
//             <button
//               type="button"
//               className="ml-2 focus:outline-none text-green-600 hover:text-green-800"
//               onClick={() => handleDeleteChip(index)}
//             >
//               <MdClose className="text-sm" />
//             </button>
//           </div>
//         ))}
//         {/* Render the input for adding new chips */}
//         <input
//           id={name}
//           name={name}
//           type="text"
//           placeholder={placeholder}
//           onKeyDown={handleKeyDown}
//           className="w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
//         />
//       </div>
//       {/* Render an error message if the input is required and not filled */}
//       {errors[name] && (
//         <span className="ml-2 text-xs tracking-wide text-red-500">
//           {label} is required
//         </span>
//       )}
//     </div>
//   )
// }

// import { useEffect, useState } from "react";
// import { MdClose } from "react-icons/md";
// import { useSelector } from "react-redux";

// // Define your color variables (replace with actual values)
// const ED_TEAL = "#2DD4BF";  // Example teal color
// const ED_TEAL_LIGHT = "#CCFBF1";  // Light teal
// const ED_TEAL_DARK = "#0D9488";  // Dark teal
// const ED_RED = "#EF4444";  // Error color

// export default function ChipInput({
//   label,
//   name,
//   placeholder,
//   register,
//   errors,
//   setValue,
//   getValues,
// }) {
//   const { editCourse, course } = useSelector((state) => state.course);
//   const [chips, setChips] = useState([]);

//   useEffect(() => {
//     if (editCourse) {
//       setChips(course?.tag || []);
//     }
//     register(name, { required: true, validate: (value) => value.length > 0 });
//   }, [register, name, editCourse, course?.tag]);

//   useEffect(() => {
//     setValue(name, chips);
//   }, [chips, name, setValue]);

//   const handleKeyDown = (event) => {
//     if (event.key === "Enter" || event.key === ",") {
//       event.preventDefault();
//       const chipValue = event.target.value.trim();
//       if (chipValue && !chips.includes(chipValue)) {
//         const newChips = [...chips, chipValue];
//         setChips(newChips);
//         event.target.value = "";
//       }
//     }
//   };

//   const handleDeleteChip = (chipIndex) => {
//     const newChips = chips.filter((_, index) => index !== chipIndex);
//     setChips(newChips);
//   };

//   // Inline styles
//   const styles = {
//     container: {
//       display: "flex",
//       flexDirection: "column",
//       gap: "8px",
//       position: "relative",
//     },
//     label: {
//       fontSize: "14px",
//       fontWeight: 500,
//       color: "#374151",  // gray-700
//     },
//     requiredStar: {
//       color: ED_RED,
//     },
//     chipsContainer: {
//       display: "flex",
//       minHeight: "44px",
//       width: "100%",
//       flexWrap: "wrap",
//       alignItems: "center",
//       gap: "8px",
//       borderRadius: "8px",
//       border: "1px solid #D1D5DB",  // gray-300
//       backgroundColor: "white",
//       padding: "8px",
//       transition: "all 0.2s ease",
//     },
//     chipsContainerFocus: {
//       borderColor: ED_TEAL,
//       boxShadow: `0 0 0 2px ${ED_TEAL}20`,  // 20% opacity
//     },
//     chip: {
//       display: "flex",
//       alignItems: "center",
//       borderRadius: "9999px",
//       backgroundColor: ED_TEAL_LIGHT,
//       padding: "4px 12px",
//       fontSize: "14px",
//       color: ED_TEAL_DARK,
//       transition: "all 0.2s ease",
//       position: "relative",
//     },
//     deleteButton: {
//       marginLeft: "8px",  // Increased spacing
//       display: "flex",
//       width: "18px",  // Slightly larger
//       height: "18px",
//       alignItems: "center",
//       justifyContent: "center",
//       borderRadius: "50%",
//       color: ED_TEAL_DARK,  // Dark teal for visibility
//       backgroundColor: "white",  // Solid white background
//       border: `1px solid ${ED_TEAL}`,  // Teal border
//       transition: "all 0.2s ease",
//       cursor: "pointer",
//       outline: "none",
//       padding: 0,
//       boxShadow: "0 0 2px rgba(0,0,0,0.1)",  // Subtle shadow for depth
//     },
//     deleteButtonHover: {
//       backgroundColor: ED_TEAL,
//       color: "white",
//       borderColor: ED_TEAL,
//       transform: "scale(1.1)",  // Slight grow effect
//     },
//     deleteIcon: {
//       fontSize: "14px",  // Larger icon
//       fontWeight: "bold",  // Bolder X
//     },
  
//     input: {
//       flex: 1,
//       minWidth: "100px",
//       border: "none",
//       background: "transparent",
//       padding: "4px",
//       color: "#111827",  // gray-900
//       outline: "none",
//     },
//     inputPlaceholder: {
//       color: "#9CA3AF",  // gray-400
//     },
//     error: {
//       fontSize: "12px",
//       color: ED_RED,
//       animation: "fadeIn 0.2s ease",
//     },
//     helperText: {
//       fontSize: "12px",
//       color: "#6B7280",  // gray-500
//     },
//   };

//   return (
//     <div style={styles.container}>
//       {/* Label */}
//       <label style={styles.label} htmlFor={name}>
//         {label} <span style={styles.requiredStar}>*</span>
//       </label>

//       {/* Chips container */}
//       <div 
//         style={{
//           ...styles.chipsContainer,
//           ...(errors[name] ? { borderColor: ED_RED } : {}),
//         }}
//       >
        
//         {chips.map((chip, index) => (
//   <div key={index} style={styles.chip}>
//     {chip}
//     <button
//       type="button"
//       style={styles.deleteButton}
//       onClick={() => handleDeleteChip(index)}
//       aria-label={`Remove ${chip}`}
//       onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.deleteButtonHover)}
//       onMouseLeave={(e) => {
//         e.currentTarget.style.backgroundColor = "white";
//         e.currentTarget.style.color = ED_TEAL_DARK;
//         e.currentTarget.style.borderColor = ED_TEAL;
//         e.currentTarget.style.transform = "scale(1)";
//       }}
//     >
//       <MdClose style={styles.deleteIcon} />
//     </button>
//   </div>
// ))}

//         {/* Input */}
//         <input
//           id={name}
//           name={name}
//           type="text"
//           placeholder={chips.length === 0 ? placeholder : ""}
//           onKeyDown={handleKeyDown}
//           style={{
//             ...styles.input,
//             ...(chips.length > 0 ? {} : styles.inputPlaceholder),
//           }}
//           onFocus={() => {
//             document.getElementById(`chip-container-${name}`).style.borderColor = ED_TEAL;
//             document.getElementById(`chip-container-${name}`).style.boxShadow = styles.chipsContainerFocus.boxShadow;
//           }}
//           onBlur={() => {
//             document.getElementById(`chip-container-${name}`).style.borderColor = errors[name] ? ED_RED : "#D1D5DB";
//             document.getElementById(`chip-container-${name}`).style.boxShadow = "none";
//           }}
//         />
//       </div>

//       {/* Error message */}
//       {errors[name] && (
//         <span style={styles.error}>
//           {label} is required
//         </span>
//       )}

//       {/* Helper text */}
//       <p style={styles.helperText}>
//         Press Enter or comma to add tags
//       </p>

//       {/* Add some global styles for the animation */}
//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//       `}</style>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import { MdClose } from "react-icons/md";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

// Define color constants at the top
const ED_TEAL = "#2DD4BF";
const ED_TEAL_LIGHT = "#CCFBF1";
const ED_TEAL_DARK = "#0D9488";
const ED_RED = "#EF4444";

export default function ChipInput({
  label,
  name,
  placeholder,
  register,
  errors,
  setValue,
  getValues,
}) {
  const { editCourse, course } = useSelector((state) => state.course);
  const [chips, setChips] = useState([]);
  const [inputValue, setInputValue] = useState("");

  // Define styles object
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      position: "relative",
    },
    label: {
      fontSize: "14px",
      fontWeight: 500,
      color: "#374151",
    },
    requiredStar: {
      color: ED_RED,
    },
    chipsContainer: {
      display: "flex",
      minHeight: "44px",
      width: "100%",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "8px",
      borderRadius: "8px",
      border: "1px solid #D1D5DB",
      backgroundColor: "white",
      padding: "8px",
      transition: "all 0.2s ease",
    },
    chip: {
      display: "flex",
      alignItems: "center",
      borderRadius: "9999px",
      backgroundColor: ED_TEAL_LIGHT,
      padding: "4px 12px",
      fontSize: "14px",
      color: ED_TEAL_DARK,
      transition: "all 0.2s ease",
    },
    deleteButton: {
      marginLeft: "8px",
      display: "flex",
      width: "18px",
      height: "18px",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      color: ED_TEAL_DARK,
      backgroundColor: "white",
      border: `1px solid ${ED_TEAL}`,
      transition: "all 0.2s ease",
      cursor: "pointer",
      outline: "none",
      padding: 0,
    },
    input: {
      flex: 1,
      minWidth: "100px",
      border: "none",
      background: "transparent",
      padding: "4px",
      color: "#111827",
      outline: "none",
    },
    inputPlaceholder: {
      color: "#9CA3AF",
    },
    error: {
      fontSize: "12px",
      color: ED_RED,
    },
    helperText: {
      fontSize: "12px",
      color: "#6B7280",
    },
    chipsContainerFocus: {
      borderColor: ED_TEAL,
      boxShadow: `0 0 0 2px ${ED_TEAL}20`,
    },
  };

  useEffect(() => {
    if (editCourse) {
      setChips(course?.tag || []);
    }
    register(name, { 
      required: true, 
      validate: (value) => {
        if (value.length === 0) {
          toast.error("Please add at least one tag");
          return false;
        }
        return true;
      }
    });
  }, [register, name, editCourse, course?.tag]);

  useEffect(() => {
    setValue(name, chips);
    // Show toast if no tags are present
    if (chips.length === 0) {
      toast.error("Please add at least one tag");
    }
  }, [chips, name, setValue]);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      const chipValue = inputValue.trim();
      
      if (!chipValue) {
        toast.error("Tag cannot be empty");
        return;
      }
      
      if (chips.includes(chipValue)) {
        toast.error("This tag already exists");
        setInputValue("");
        return;
      }
      
      const newChips = [...chips, chipValue];
      setChips(newChips);
      setInputValue("");
      toast.success("Tag added successfully");
    }
  };

  const handleDeleteChip = (chipIndex) => {
    const newChips = chips.filter((_, index) => index !== chipIndex);
    setChips(newChips);
    toast.success("Tag removed");
    
    // Show warning if last tag was removed
    if (newChips.length === 0) {
      toast.error("Please add at least one tag");
    }
  };

  return (
    <div style={styles.container}>
      <label style={styles.label} htmlFor={name}>
        {label} <span style={styles.requiredStar}>*</span>
      </label>

      <div 
        style={{
          ...styles.chipsContainer,
          ...(errors[name] ? { borderColor: ED_RED } : {}),
        }}
      >
        {chips.map((chip, index) => (
          <div key={index} style={styles.chip}>
            {chip}
            <button
              type="button"
              style={styles.deleteButton}
              onClick={() => handleDeleteChip(index)}
              aria-label={`Remove ${chip}`}
            >
              <MdClose style={{ fontSize: "14px" }} />
            </button>
          </div>
        ))}

        <input
          id={name}
          name={name}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={chips.length === 0 ? placeholder : ""}
          onKeyDown={handleKeyDown}
          style={{
            ...styles.input,
            ...(chips.length > 0 ? {} : styles.inputPlaceholder),
          }}
        />
      </div>

      {errors[name] && (
        <span style={styles.error}>
          Please add at least one tag
        </span>
      )}

      <p style={styles.helperText}>
        Press Enter or comma to add tags
      </p>
    </div>
  );
}