const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Profile = require('../models/Profile');
const UserType = require('../models/UserType');

// POST /api/v1/super-admin/create-user
// Body: { firstName, lastName, email, contactNumber, password, confirmPassword, role }
// role examples (from UI): 'Super Admin' | 'Admission' | 'Account' | 'Exam'
exports.createUserBySuperAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      contactNumber,
      password,
      confirmPassword,
      role,
    } = req.body || {};

    if (!firstName || !lastName || !email || !contactNumber || !password || !confirmPassword || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine accountType and optional UserType based on role label
    let accountType = 'Admin';
    let userTypeId = null;

    const norm = String(role).trim().toLowerCase();
    if (norm === 'super admin' || norm === 'super-admin' || norm === 'superadmin') {
      accountType = 'SuperAdmin';
    } else if (['admission', 'account', 'exam', 'content-management', 'content management'].includes(norm)) {
      // Map label to a dynamic UserType document (create if missing)
      const name = role.trim();
      let uType = await UserType.findOne({ name });
      if (!uType) {
        uType = await UserType.create({ name, description: `${name} role` });
      }
      userTypeId = uType._id;
      // Keep accountType as Admin to pass admin-level checks; capabilities come from userType flags
      accountType = 'Admin';
    } else if (norm === 'instructor') {
      accountType = 'Instructor';
    } else if (norm === 'student') {
      accountType = 'Student';
    }

    // Create profile
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      approved: true,
      createdByAdmin: true,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${encodeURIComponent(firstName + ' ' + (lastName || ''))}`,
      userType: userTypeId,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contactNumber: user.contactNumber,
        accountType: user.accountType,
        userType: user.userType,
      },
    });
  } catch (error) {
    console.error('Error creating user by super admin:', error);
    return res.status(500).json({ success: false, message: 'Failed to create user', error: error.message });
  }
};
