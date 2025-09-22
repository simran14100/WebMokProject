// Import necessary modules
const Section = require("../models/Section");
const SubSection = require("../models/Subsection");
const { uploadVideoToCloudinary } = require("../utils/imageUploader");

// Create a new sub-section for a given section
exports.createSubSection = async (req, res) => {
  try {
    const { sectionId, title, description, videoUrl, duration } = req.body;

    console.log("[createSubSection] Request received:", {
      sectionId,
      title: title ? `${title.substring(0, 30)}...` : 'undefined',
      description: description ? `${description.substring(0, 50)}...` : 'undefined',
      hasVideo: !!videoUrl,
      videoUrl: videoUrl ? `${videoUrl.substring(0, 60)}...` : 'undefined'
    });

    // Validate required fields
    if (!sectionId || !title) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: sectionId and title are required"
      });
    }

    if (!videoUrl) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required"
      });
    }

    // Validate section exists
    const section = await Section.findById(sectionId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found"
      });
    }

    // Create the SubSection document
    const SubSectionDetails = await SubSection.create({
      title,
      timeDuration: duration ? `${Math.round(duration)}` : '0',
      description: description || '',
      videoUrl,
    });

    // Push into Section
    const updatedSection = await Section.findByIdAndUpdate(
      { _id: sectionId },
      { $push: { subSection: SubSectionDetails._id } },
      { new: true }
    ).populate("subSection");

    return res.status(200).json({ 
      success: true, 
      message: "Subsection created successfully",
      data: updatedSection 
    });
  } catch (error) {
    console.error("[createSubSection] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
}


  exports.updateSubSection = async (req, res) => {
    try {
      console.log('updateSubSection - Request body:', req.body);
      console.log('updateSubSection - Files:', req.files);
      
      const { sectionId, subSectionId, title, description, videoUrl } = req.body;
      
      // Validate required fields
      if (!sectionId || !subSectionId) {
        return res.status(400).json({
          success: false,
          message: "sectionId and subSectionId are required"
        });
      }
      
      // Find the subsection and its parent section
      const [subSection, section] = await Promise.all([
        SubSection.findById(subSectionId),
        Section.findById(sectionId)
      ]);
      
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found"
        });
      }
      
      if (!section) {
        return res.status(404).json({
          success: false,
          message: "Parent section not found"
        });
      }
      
      // Update title if provided
      if (title !== undefined) {
        subSection.title = title.trim();
      }
      
      // Update description if provided
      if (description !== undefined) {
        subSection.description = description.trim();
      }
      
      // Handle video file upload if provided
      if (req.files?.video) {
        try {
          const videoFile = req.files.video;
          console.log('Uploading new video file to Cloudinary...', {
            name: videoFile.name,
            mimetype: videoFile.mimetype,
            size: videoFile.size
          });
          
          // Use the file data directly from memory if available, otherwise use temp file path
          const fileToUpload = videoFile.data ? videoFile : (videoFile.tempFilePath || videoFile);
          
          const uploadDetails = await uploadVideoToCloudinary(
            fileToUpload,
            `courses/${section.courseId}/sections/${sectionId}`,
            {
              resource_type: 'video',
              chunk_size: 6000000, // 6MB chunks for large files
              eager: [
                { width: 640, height: 360, crop: 'fill', format: 'mp4' },
                { width: 1280, height: 720, crop: 'fill', format: 'mp4' },
              ],
              eager_async: true,
              eager_notification_url: process.env.CLOUDINARY_WEBHOOK_URL,
              folder: `courses/${section.courseId}/sections/${sectionId}`,
              use_filename: true,
              unique_filename: true,
              overwrite: false,
            }
          );
          
          console.log('Video upload successful:', {
            url: uploadDetails.secure_url,
            public_id: uploadDetails.public_id,
            duration: uploadDetails.duration,
            format: uploadDetails.format,
            bytes: uploadDetails.bytes,
          });
          
          // Store the new video URL and duration
          subSection.videoUrl = uploadDetails.secure_url;
          subSection.timeDuration = `${uploadDetails.duration || 0}`;
          
          // Optionally delete the old video from Cloudinary if it exists
          // Note: You might want to implement a cleanup job instead of deleting immediately
          // to handle potential failures in the update process
          
        } catch (uploadError) {
          console.error('Error uploading video to Cloudinary:', uploadError);
          return res.status(502).json({
            success: false,
            message: "Failed to upload video to Cloudinary",
            error: uploadError.message,
            code: uploadError.http_code || 500
          });
        }
      } else if (videoUrl) {
        // If videoUrl is provided in the request body (for external URLs)
        subSection.videoUrl = videoUrl;
        // Reset duration for external URLs or set to null if not applicable
        subSection.timeDuration = "0";
      }
      
      // Save the updated subsection
      await subSection.save();
      
      // Find and return the updated section with populated subsections
      const updatedSection = await Section.findById(sectionId)
        .populate("subSection")
        .exec();
      
      if (!updatedSection) {
        return res.status(404).json({
          success: false,
          message: "Parent section not found after update"
        });
      }
      
      return res.status(200).json({
        success: true,
        message: "Subsection updated successfully",
        data: updatedSection
      });
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }
  
  exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      const updatedSection= await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        },{
          new:true
        }
      ).populate(
        "subSection"
      )
  
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
  
      return res.json({
        success: true,
        message: "SubSection deleted successfully",
        data: updatedSection
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }