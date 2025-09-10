const mongoose = require('mongoose');
const Document = require('../models/Document');
const User = require('../models/User');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
const fs = require('fs');
const path = require('path');

// Maximum file size in bytes (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

exports.uploadDocument = async (req, res) => {
  try {
    // Get the file from the middleware
    const file = req.uploadedFile;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file was uploaded or file validation failed.'
      });
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the maximum limit of 10MB.'
      });
    }

    const { name, mimetype, size } = file;
    
    // Debug log the user object
    console.log('Request user:', req.user);
    
    // Handle both req.user.id and req.user._id
    const studentId = req.user._id || req.user.id;
    
    if (!req.user || !studentId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated or user ID missing',
        user: req.user // Include user object in response for debugging
      });
    }

    // Check if student exists
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
        userId: studentId
      });
    }

    try {
      // Read the file data from the temporary file
      const fileData = fs.readFileSync(file.tempFilePath);
      
      // Upload file to Cloudinary
      const uploadResult = await uploadImageToCloudinary(
        fileData,
        'documents', // Folder in Cloudinary
        null, // No height restriction
        90 // Quality
      );

      if (!uploadResult || !uploadResult.secure_url) {
        throw new Error('Failed to upload file to Cloudinary');
      }

      // Create document record with Cloudinary URL
      const document = await Document.create({
        fileName: name,
        filePath: uploadResult.secure_url,
        fileType: mimetype,
        fileSize: size,
        student: new mongoose.Types.ObjectId(studentId), // Ensure student is stored as ObjectId
        cloudinaryPublicId: uploadResult.public_id, // Store Cloudinary public ID for future reference
        fileFormat: uploadResult.format
      });

      // Add document reference to user
      if (!student.documents) {
        student.documents = [];
      }
      student.documents.push(document._id);
      await student.save();

      return res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        document: {
          _id: document._id,
          fileName: document.fileName,
          filePath: document.filePath,
          fileType: document.fileType,
          fileSize: document.fileSize,
          uploadedAt: document.createdAt
        }
      });
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      
      // Clean up any uploaded files in case of error
      if (req.files) {
        for (const file of Object.values(req.files)) {
          if (file.tempFilePath && fs.existsSync(file.tempFilePath)) {
            try {
              await fs.promises.unlink(file.tempFilePath);
            } catch (cleanupError) {
              console.error('Error cleaning up temp file:', cleanupError);
            }
          }
        }
      }
      
      return res.status(500).json({
        success: false,
        message: 'Error uploading document to storage',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Error in uploadDocument:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing document upload',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

exports.getStudentDocuments = async (req, res) => {
  try {
    console.log('Fetching documents for user:', req.user);
    
    // Handle both req.user.id and req.user._id
    const studentId = req.user._id || req.user.id;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'User ID not found in request'
      });
    }
    
    console.log('Searching for documents with student ID:', studentId);
    
    // Convert studentId to ObjectId for the query
    const objectId = new mongoose.Types.ObjectId(studentId);
    
    // Find documents where student matches either as string or ObjectId
    const documents = await Document.find({
      $or: [
        { student: objectId },
        { student: studentId.toString() }
      ]
    }).sort({ createdAt: -1 });
      
    console.log(`Found ${documents.length} documents for student ${studentId}`);

    res.status(200).json({
      success: true,
      count: documents.length,
      documents: documents.map(doc => ({
        _id: doc._id,
        fileName: doc.fileName,
        filePath: doc.filePath,
        fileType: doc.fileType,
        fileSize: doc.fileSize,
        uploadedAt: doc.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents',
      error: error.message
    });
  }
};

exports.deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const studentId = req.user.id;

    // Find the document and verify ownership
    const document = await Document.findOne({
      _id: documentId,
      student: studentId
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found or unauthorized'
      });
    }

    // Delete file from Cloudinary if public ID exists
    if (document.cloudinaryPublicId) {
      try {
        const cloudinary = require('cloudinary').v2;
        await cloudinary.uploader.destroy(document.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Error deleting file from Cloudinary:', cloudinaryError);
        // Continue with document deletion even if Cloudinary deletion fails
      }
    }

    // Remove document reference from user
    await User.findByIdAndUpdate(studentId, {
      $pull: { documents: documentId }
    });

    // Delete document record
    await Document.findByIdAndDelete(documentId);

    res.status(200).json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting document',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
