// // List of all available exam types with their configurations
// const examTypes = [
//   {
//     code: 'theory',
//     name: 'Theory',
//     requiresMarks: true,
//     requiresMaxMarks: true
//   },
//   {
//     code: 'practical',
//     name: 'Practical',
//     requiresMarks: true,
//     requiresMaxMarks: true
//   },
//   {
//     code: 'viva',
//     name: 'Viva Voce',
//     requiresMarks: true,
//     requiresMaxMarks: true
//   },
//   {
//     code: 'project',
//     name: 'Project',
//     requiresMarks: true,
//     requiresMaxMarks: true
//   },
//   {
//     code: 'assignment',
//     name: 'Assignment',
//     requiresMarks: true,
//     requiresMaxMarks: true
//   }
// ];

// // Helper functions
// getAllExamTypes = () => {
//   return examTypes.map(({ code, name }) => ({ code, name }));
// };

// getExamTypeByCode = (code) => {
//   return examTypes.find(type => type.code === code);
// };

// // Get exam type codes for schema validation
// getExamTypeCodes = () => {
//   return examTypes.map(type => type.code);
// };

// module.exports = {
//   examTypes,
//   getAllExamTypes,
//   getExamTypeByCode,
//   getExamTypeCodes
// };
// List of all available exam types with their configurations
const examTypes = [
  {
    code: 'theory',
    name: 'Theory',
    requiresMarks: true,
    requiresMaxMarks: true
  },
  {
    code: 'practical',
    name: 'Practical',
    requiresMarks: true,
    requiresMaxMarks: true
  },
  {
    code: 'viva',
    name: 'Viva Voce',
    requiresMarks: true,
    requiresMaxMarks: true
  },
  {
    code: 'project',
    name: 'Project',
    requiresMarks: true,
    requiresMaxMarks: true
  },
  {
    code: 'assignment',
    name: 'Assignment',
    requiresMarks: true,
    requiresMaxMarks: true
  }
];

// Helper functions
const getAllExamTypes = () => {
  return examTypes.map(({ code, name }) => ({ code, name }));
};

const getExamTypeByCode = (code) => {
  return examTypes.find(type => type.code === code);
};

// Get exam type codes for schema validation
const getExamTypeCodes = () => {
  return examTypes.map(type => type.code);
};

module.exports = {
  examTypes,
  getAllExamTypes,
  getExamTypeByCode,
  getExamTypeCodes
};