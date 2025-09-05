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

        // Function to handle Cloudinary upload from buffer or base64
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