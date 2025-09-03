const AdmissionEnquiry = require('../models/AdmissionEnquiry');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('express-async-handler');
const { default: mongoose } = require('mongoose');

// @desc    Get admission enquiries by program type (UG/PG)
// @route   GET /api/v1/admission-enquiries/program/:programType
// @access  Private/Admin
exports.getEnquiriesByProgramType = asyncHandler(async (req, res, next) => {
  try {
    const { programType } = req.params;
    const { page = 1, limit = 10, status = '' } = req.query;
    
    // Validate program type
    if (!['UG', 'PG', 'PHD'].includes(programType.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid program type. Must be UG, PG, or PHD'
      });
    }

    const query = { programType: programType.toUpperCase() };
    
    // Status filter
    if (status) {
      query.status = status;
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 }
    };

    const result = await AdmissionEnquiry.paginate(query, options);

    res.status(200).json({
      success: true,
      data: {
        enquiries: result.docs,
        total: result.totalDocs,
        totalPages: result.totalPages,
        page: result.page,
        limit: result.limit,
      }
    });
  } catch (error) {
    console.error('Error getting enquiries by program type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching enquiries',
      error: error.message
    });
  }
});

// @desc    Create a new admission enquiry
// @route   POST /api/v1/admission-enquiries
// @access  Public
exports.createAdmissionEnquiry = async (req, res) => {
    try {
        const {
            name,
            email,
            phone,
            programType,
            fatherName,
            dateOfBirth,
            gender,
            parentName,
            alternateNumber,
            address,
            city,
            state,
            qualification, // Frontend uses 'qualification' instead of 'lastClass'
            boardSchoolName,
            percentage,
            academicYear,
            stream,
            graduationCourse
        } = req.body;
        
        // Map qualification to lastClass for database
        const lastClass = qualification || '';
        
        // Ensure qualification is not empty
        if (!lastClass || lastClass.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Last class/qualification is required',
                field: 'qualification'
            });
        }
        
        // Ensure graduationCourse is not empty
        if (!graduationCourse || graduationCourse.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Graduation course is required',
                field: 'graduationCourse'
            });
        }
        
        // Validate required fields
        const requiredFields = {
            name: 'Full Name',
            email: 'Email',
            phone: 'Phone Number',
            programType: 'Program Type',
            dateOfBirth: 'Date of Birth',
            qualification: 'Last Class/Qualification',
            boardSchoolName: 'Board/University & School Name',
            graduationCourse: 'Graduation Course'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([field]) => !req.body[field])
            .map(([_, label]) => label);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`,
                missingFields: Object.keys(requiredFields).reduce((acc, field) => ({
                    ...acc,
                    [field]: !req.body[field]
                }), {})
            });
        }

        // Validate program type
        if (!['UG', 'PG', 'PHD'].includes(programType.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid program type. Must be UG, PG, or PHD'
            });
        }

        // Check if enquiry already exists with same email and program
        const existingEnquiry = await AdmissionEnquiry.findOne({
            email: email.toLowerCase(),
            programType: programType.toUpperCase()
        });

        if (existingEnquiry) {
            return res.status(409).json({
                success: false,
                message: 'An enquiry with this email already exists for the selected program',
                enquiry: existingEnquiry
            });
        }

        // Create new enquiry with all fields
        const enquiry = new AdmissionEnquiry({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            programType: programType.toUpperCase(),
            dateOfBirth: new Date(dateOfBirth),
            ...(gender && { gender }),
            ...(parentName && { parentName: parentName.trim() }),
            ...(fatherName && { fatherName: fatherName.trim() }),
            ...(alternateNumber && { alternateNumber: alternateNumber.trim() }),
            ...(address && { address: address.trim() }),
            ...(city && { city: city.trim() }),
            ...(state && { state: state.trim() }),
            ...(lastClass && { lastClass: lastClass.trim() }), // This now comes from qualification
            ...(boardSchoolName && { boardSchoolName: boardSchoolName.trim() }),
            ...(percentage && { percentage: parseFloat(percentage) }),
            ...(academicYear && { academicYear: academicYear.trim() }),
            ...(stream && { stream: stream.trim() }),
            graduationCourse: graduationCourse.trim(),
            ...(req.user?.id && { user: req.user.id })
        });

        try {
            await enquiry.save();
            console.log('Enquiry saved successfully:', enquiry);
        } catch (saveError) {
            console.error('Error saving enquiry:', saveError);
            if (saveError.name === 'ValidationError') {
                console.error('Validation errors:', saveError.errors);
            }
            throw saveError;
        }

        // If user is logged in, create enrollment record
        if (req.user?.id) {
            const enrollment = new Enrollment({
                user: req.user.id,
                programType: programType.toUpperCase(),
                status: 'pending'
            });
            await enrollment.save();
        }

        return res.status(201).json({
            success: true,
            message: 'Admission enquiry submitted successfully',
            data: enquiry
        });

    } catch (error) {
        console.error('Error creating admission enquiry:', error);
        return res.status(500).json({
            success: false,
            message: 'Error submitting admission enquiry',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// @desc    Debug endpoint to list all enquiries (temporary)
// @route   GET /api/v1/admission-enquiries/debug
// @access  Private/Admin
exports.debugListAllEnquiries = asyncHandler(async (req, res) => {
  try {
    const enquiries = await AdmissionEnquiry.find({}).lean();
    console.log('Total enquiries in DB:', enquiries.length);
    
    if (enquiries.length > 0) {
      console.log('Sample enquiry:', enquiries[0]);
    }
    
    return res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries
    });
  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching debug information',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get all admission enquiries
// @route   GET /api/v1/admission/enquiries
// @access  Private/Admin
exports.getAllAdmissionEnquiries = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    sort = '-createdAt',
  } = req.query;

  const query = {};

  // Enhanced search filter
  if (search) {
    // If search term contains a space, try to split into first and last name
    const searchTerms = search.split(' ');
    
    if (searchTerms.length > 1) {
      // If there are multiple search terms, try combinations
      const firstName = searchTerms[0];
      const lastName = searchTerms.slice(1).join(' ');
      
      query.$or = [
        { name: { $regex: search, $options: 'i' } }, // Full name match
        { email: { $regex: search, $options: 'i' } }, // Email match
        { phone: { $regex: search, $options: 'i' } }, // Phone match
        { fatherName: { $regex: search, $options: 'i' } }, // Father's name match
        { 
          $and: [
            { name: { $regex: firstName, $options: 'i' } },
            { name: { $regex: lastName, $options: 'i' } }
          ]
        }
      ];
    } else {
      // Single search term - check all relevant fields
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } }
      ];
    }
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    populate: 'course',
  };

  // Remove course population since it's not in the model
  delete options.populate;
  
  const result = await AdmissionEnquiry.paginate(query, options);

  res.status(200).json({
    success: true,
    data: {
      enquiries: result.docs,
      total: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
    },
  });
});

// @desc    Get single admission enquiry
// @route   GET /api/v1/admission-enquiries/:id
// @access  Private/Admin
exports.getAdmissionEnquiry = asyncHandler(async (req, res) => {
  try {
    const enquiry = await AdmissionEnquiry.findById(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
    }

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (error) {
    console.error('Error fetching admission enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admission enquiry',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Process enquiry to admission
// @route   POST /api/v1/admission-enquiries/:id/process-to-admission
// @access  Private/Admin
exports.processToAdmission = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      source, 
      isScholarship, 
      scholarshipType, 
      followUpDate, 
      notes 
    } = req.body;

    // Find the enquiry
    const enquiry = await AdmissionEnquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
    }

    // Save admission details in a structured format
    enquiry.admissionDetails = {
      source,
      isScholarship: Boolean(isScholarship),
      ...(isScholarship && { scholarshipType }),
      followUpDate: new Date(followUpDate),
      processedAt: new Date(),
      processedBy: req.user.id
    };

    // Add notes to the existing notes array or create a new one
    if (notes) {
      if (!enquiry.notes) {
        enquiry.notes = [];
      }
      enquiry.notes.push({
        content: notes,
        type: 'admission_processing',
        createdBy: req.user.id,
        createdAt: new Date()
      });
    }

    await enquiry.save();

    res.status(200).json({
      success: true,
      message: 'Admission details saved successfully',
      data: {
        enquiry,
        admissionDetails: enquiry.admissionDetails
      }
    });
  } catch (error) {
    console.error('Error processing to admission:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing to admission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Update admission enquiry status
// @route   PUT /api/v1/admission-enquiries/:id/status
// @access  Private/Admin
exports.updateEnquiryStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    // Validate status value
    const validStatuses = ['pending', 'contacted', 'converted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const enquiry = await AdmissionEnquiry.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
    }

    // Add status update note
    const note = {
      content: `Status changed to ${status}`,
      createdBy: req.user.id,
      createdAt: new Date()
    };

    enquiry.notes.push(note);
    await enquiry.save();

    res.status(200).json({
      success: true,
      message: 'Enquiry status updated successfully',
      data: enquiry,
    });
  } catch (error) {
    console.error('Error updating enquiry status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating enquiry status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Delete admission enquiry
// @route   DELETE /api/v1/admission-enquiries/:id
// @access  Private/Admin
exports.deleteEnquiry = asyncHandler(async (req, res) => {
  try {
    const enquiry = await AdmissionEnquiry.findByIdAndDelete(req.params.id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry not found',
      });
    }

    // Optionally, you might want to also delete related enrollment records
    if (enquiry.user) {
      await Enrollment.deleteMany({
        user: enquiry.user,
        programType: enquiry.programType
      });
    }

    res.status(200).json({
      success: true,
      message: 'Enquiry deleted successfully',
      data: {},
    });
  } catch (error) {
    console.error('Error deleting enquiry:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting enquiry',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});
