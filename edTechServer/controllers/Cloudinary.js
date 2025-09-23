const cloudinary = require('cloudinary').v2;

exports.getUploadSignature = async (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);

    // Use only server-side configuration; ignore any client-provided preset/folder
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || process.env.API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET || process.env.API_SECRET;
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || process.env.FOLDER_NAME ;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || undefined;

    console.log('[Cloudinary:signature] Using folder:', folder);
    console.log('[Cloudinary:signature] Cloud name set:', !!cloudName);
    console.log('[Cloudinary:signature] API key set:', !!apiKey);
    console.log('[Cloudinary:signature] API secret set:', !!apiSecret);
    console.log('[Cloudinary:signature] Timestamp:', timestamp);

    const paramsToSign = uploadPreset
      ? { timestamp, folder, upload_preset: uploadPreset }
      : { timestamp, folder };
    const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);
    console.log('[Cloudinary:signature] Params to sign:', paramsToSign);
    console.log('[Cloudinary:signature] Signature generated:', !!signature);

    return res.status(200).json({
      success: true,
      data: {
        timestamp,
        signature,
        apiKey,
        cloudName,
        folder,
        uploadPreset: uploadPreset || null,
      }
    });
  } catch (error) {
    console.error('Error generating Cloudinary signature:', error);
    return res.status(500).json({ success: false, message: 'Failed to create signature' });
  }
};


