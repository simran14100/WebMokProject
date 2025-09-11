const asyncHandler = require('express-async-handler');
const School = require('../models/UGPGSchool');
const Subject = require('../models/UGPGSubject');
const AcademicSession = require('../models/UGPGSession');

// @desc    Get all schools
// @route   GET /api/academic/schools
// @access  Private
const getSchools = asyncHandler(async (req, res) => {
  try {
    const schools = await School.find({}, 'name code').sort({ name: 1 });
    res.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get subjects by school
// @route   GET /api/academic/subjects/:schoolId
// @access  Private
const getSubjectsBySchool = asyncHandler(async (req, res) => {
  try {
    const { schoolId } = req.params;
    const subjects = await Subject.find({ school: schoolId }, 'name code').sort({ name: 1 });
    res.json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get all academic sessions
// @route   GET /api/academic/sessions
// @access  Private
const getAcademicSessions = asyncHandler(async (req, res) => {
  try {
    const sessions = await AcademicSession.find({}, 'name startDate endDate').sort({ startDate: -1 });
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching academic sessions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  getSchools,
  getSubjectsBySchool,
  getAcademicSessions
};
