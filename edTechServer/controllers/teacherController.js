const Teacher = require('../models/Teacher');
const asyncHandler = require('express-async-handler');

// @desc    Create a new teacher
// @route   POST /api/v1/teachers
// @access  Private/Admin
exports.createTeacher = asyncHandler(async (req, res) => {
  const { name, email, phone, school, designation, subjects, salary, address } = req.body;

  // Check if teacher already exists
  const teacherExists = await Teacher.findOne({ email });
  if (teacherExists) {
    res.status(400);
    throw new Error('Teacher with this email already exists');
  }

  const numericSalary = Number(salary) || 0;
  const pfDeduct = Number((numericSalary * 0.12).toFixed(2));

  const teacher = await Teacher.create({
    name,
    email,
    phone,
    school,
    designation,
    address: address || '',
    salary: numericSalary,
    pfDeduct,
    subjects: subjects || []
  });

  res.status(201).json({
    success: true,
    data: teacher
  });
});

// @desc    Get all teachers
// @route   GET /api/v1/teachers
// @access  Private/Admin
exports.getTeachers = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 1000, search = '', school } = req.query;
    
    const query = { isActive: true };
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by school if provided
    if (school) {
      query.school = school;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { name: 1 },
      populate: [
        { path: 'school', select: 'name' },
        { path: 'subjects', select: 'name code' }
      ]
    };

    const teachers = await Teacher.paginate(query, options);
    
    // Log the query and results for debugging
    console.log('Teachers query:', { query, options });
    console.log('Teachers found:', teachers.docs.length);
    
    // Return both paginated and direct array response for backward compatibility
    if (req.query.raw === 'true') {
      // Return raw array for dropdowns
      return res.status(200).json(teachers.docs);
    }
    
    return res.status(200).json({
      success: true,
      count: teachers.totalDocs,
      data: teachers.docs,
      pagination: {
        total: teachers.totalDocs,
        limit: teachers.limit,
        page: teachers.page,
        pages: teachers.totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  res.json({
    success: true,
    ...teachers
  });
});

// @desc    Get single teacher
// @route   GET /api/v1/teachers/:id
// @access  Private/Admin
exports.getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('school', 'name')
    .populate('subjects', 'name code');

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  res.json({
    success: true,
    data: teacher
  });
});

// @desc    Update teacher
// @route   PUT /api/v1/teachers/:id
// @access  Private/Admin
exports.updateTeacher = asyncHandler(async (req, res) => {
  const { name, email, phone, school, designation, subjects, salary, address } = req.body;

  let teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  // Check if email is being updated and if it already exists
  if (email && email !== teacher.email) {
    const emailExists = await Teacher.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }

  const numericSalary = salary !== undefined ? Number(salary) : teacher.salary || 0;
  const pfDeduct = Number(((numericSalary || 0) * 0.12).toFixed(2));

  teacher = await Teacher.findByIdAndUpdate(
    req.params.id,
    {
      name: name || teacher.name,
      email: email || teacher.email,
      phone: phone || teacher.phone,
      school: school || teacher.school,
      designation: designation || teacher.designation,
      subjects: subjects || teacher.subjects,
      address: address !== undefined ? address : teacher.address,
      salary: numericSalary,
      pfDeduct,
      updatedAt: Date.now()
    },
    { new: true, runValidators: true }
  )
  .populate('school', 'name')
  .populate('subjects', 'name code');

  res.json({
    success: true,
    data: teacher
  });
});

// @desc    Delete teacher
// @route   DELETE /api/v1/teachers/:id
// @access  Private/Admin
exports.deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);

  if (!teacher) {
    res.status(404);
    throw new Error('Teacher not found');
  }

  // Soft delete
  teacher.isActive = false;
  await teacher.save();

  res.json({
    success: true,
    data: {}
  });
});
