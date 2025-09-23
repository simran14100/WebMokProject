const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

/**
 * Uploads a file to Cloudinary from a base64 string or buffer
 * @param {String|Buffer} fileData - The file data as base64 string or buffer
 * @param {String} folder - The folder in Cloudinary where the file should be stored
 * @param {Number} height - Optional height for image resizing
 * @param {Number} quality - Optional image quality (1-100)
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
exports.uploadImageToCloudinary = (fileData, folder = 'webmok-uploads', height = null, quality = 90) => {
    console.log(`Starting upload to folder: ${folder}`);
    
    return new Promise((resolve, reject) => {
        // Validate input
        if (!fileData) {
            const error = new Error('No file data provided');
            console.error('Upload error:', error.message);
            return reject(error);
        }

        // Configure upload options
        const options = {
            folder: folder,
            resource_type: 'auto',
            quality: quality,
            ...(height && { height: height, crop: 'scale' }),
            transformation: [
                { width: 800, crop: 'scale' },
                { quality: 'auto:good' }
            ]
        };

        console.log('Upload options:', JSON.stringify(options, null, 2));

        // Short-circuit: if it's already a Cloudinary URL, return as-is
        if (typeof fileData === 'string' && /^https?:\/\//i.test(fileData)) {
            if (/res\.cloudinary\.com\//.test(fileData)) {
                console.log('Provided value is already a Cloudinary URL. Skipping re-upload.');
                return resolve({ secure_url: fileData });
            }
        }

        // Function to handle Cloudinary upload from URL, buffer or base64
        const uploadToCloudinary = (data) => {
            return new Promise((resolve, reject) => {
                if (typeof data === 'string' && data.startsWith('data:')) {
                    // Handle base64 string
                    cloudinary.uploader.upload(data, options, (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            return reject(error);
                        }
                        console.log('Upload successful:', result.secure_url);
                        resolve(result);
                    });
                } else if (typeof data === 'string' && /^https?:\/\//i.test(data)) {
                    // Handle remote URL
                    cloudinary.uploader.upload(data, options, (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error (URL):', error);
                            return reject(error);
                        }
                        console.log('Upload successful (URL):', result.secure_url);
                        resolve(result);
                    });
                } else if (Buffer.isBuffer(data)) {
                    // Handle buffer
                    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            return reject(error);
                        }
                        console.log('Upload successful:', result.secure_url);
                        resolve(result);
                    });

                    // Create a readable stream from the buffer
                    const bufferStream = new Readable();
                    bufferStream.push(data);
                    bufferStream.push(null);
                    bufferStream.pipe(uploadStream);
                } else {
                    const error = new Error('Unsupported file format. Expected base64 string or buffer.');
                    console.error('Upload error:', error.message);
                    reject(error);
                }
            });
        };

        // Process the file upload
        uploadToCloudinary(fileData)
            .then(result => {
                if (!result || !result.secure_url) {
                    throw new Error('Invalid upload response from Cloudinary');
                }
                resolve(result);
            })
            .catch(error => {
                console.error('Upload process failed:', error);
                reject(error);
            });
    });
};

/**
 * Uploads a video to Cloudinary from URL, base64, buffer, or file object
 * @param {String|Buffer|Object} fileData - URL/base64/buffer or file object with buffer/path
 * @param {String} folder - Target folder
 * @param {Object} overrideOptions - Additional Cloudinary options
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
exports.uploadVideoToCloudinary = (fileData, folder = 'webmok-videos', overrideOptions = {}) => {
    const resolvedFolder = folder || process.env.CLOUDINARY_UPLOAD_FOLDER || process.env.FOLDER_NAME || 'webmok-videos';
    console.log(`Starting video upload to folder: ${resolvedFolder}`);

    return new Promise((resolve, reject) => {
        if (!fileData) {
            const error = new Error('No video data provided');
            console.error('Video upload error:', error.message);
            return reject(error);
        }

        // If already a Cloudinary URL, return as-is
        if (typeof fileData === 'string' && /^https?:\/\//i.test(fileData) && /res\.cloudinary\.com\//.test(fileData)) {
            console.log('Provided video is already a Cloudinary URL. Skipping re-upload.');
            return resolve({ secure_url: fileData });
        }

        const baseOptions = {
            folder: resolvedFolder,
            resource_type: 'video',
            chunk_size: 6 * 1024 * 1024, // 6MB chunks
            eager_async: true,
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            ...overrideOptions,
        };

        const doUpload = (data) => {
            // Prefer upload_large for large/buffer uploads
            const uploadCallback = (error, result) => {
                if (error) {
                    console.error('Cloudinary video upload error:', error);
                    return reject(error);
                }
                console.log('Video upload successful:', result.secure_url);
                resolve(result);
            };

            if (typeof data === 'string' && data.startsWith('data:')) {
                // data URL
                cloudinary.uploader.upload(data, { ...baseOptions, resource_type: 'video' }, uploadCallback);
            } else if (typeof data === 'string' && /^https?:\/\//i.test(data)) {
                // remote URL
                cloudinary.uploader.upload(data, { ...baseOptions, resource_type: 'video' }, uploadCallback);
            } else if (Buffer.isBuffer(data)) {
                const uploadStream = cloudinary.uploader.upload_large_stream({ ...baseOptions, resource_type: 'video' }, uploadCallback);
                const bufferStream = new Readable();
                bufferStream.push(data);
                bufferStream.push(null);
                bufferStream.pipe(uploadStream);
            } else if (data && typeof data === 'object' && (data.buffer || data.path || data.tempFilePath)) {
                if (data.buffer && Buffer.isBuffer(data.buffer)) {
                    const uploadStream = cloudinary.uploader.upload_large_stream({ ...baseOptions, resource_type: 'video' }, uploadCallback);
                    const bufferStream = new Readable();
                    bufferStream.push(data.buffer);
                    bufferStream.push(null);
                    bufferStream.pipe(uploadStream);
                } else if (data.path || data.tempFilePath) {
                    const filePath = data.path || data.tempFilePath;
                    cloudinary.uploader.upload_large(filePath, { ...baseOptions, resource_type: 'video' }, uploadCallback);
                } else {
                    reject(new Error('Unsupported video file object'));
                }
            } else {
                reject(new Error('Unsupported video data format'));
            }
        };

        doUpload(fileData);
    });
};