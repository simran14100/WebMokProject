const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

/**
 * Uploads a file to Cloudinary directly from memory
 * @param {Object} file - The file object from express-fileupload
 * @param {String} folder - The folder in Cloudinary where the file should be stored
 * @param {Number} height - Optional height for image resizing
 * @param {Number} quality - Optional image quality (1-100)
 * @param {Number} quality - Optional quality for image compression (1-100)
 * @returns {Promise<Object>} - The Cloudinary upload result
 */
exports.uploadImageToCloudinary = (file, folder = 'webmok-uploads', height = null, quality = 90) => {
    console.log(`Starting upload of ${file.name} to folder: ${folder}`);
    
    return new Promise((resolve, reject) => {
        // Validate input
        if (!file) {
            const error = new Error('No file provided');
            console.error('Upload error:', error.message);
            return reject(error);
        }

        // Check if we have data or temp file path
        const hasData = file.data && file.data.length > 0;
        const hasTempPath = file.tempFilePath;
        
        if (!hasData && !hasTempPath) {
            const error = new Error('No file data or temp file path available');
            console.error('Upload error:', error.message);
            return reject(error);
        }

        console.log(`File info: ${file.name}, size: ${file.size} bytes, mimetype: ${file.mimetype}`);
        
        // Configure upload options
        const options = {
            folder: folder,
            resource_type: 'auto',
            quality: quality,
            ...(height && { height: height, crop: 'scale' }),
            // Add more Cloudinary transformations as needed
            transformation: [
                { width: 800, crop: 'scale' },
                { quality: 'auto:good' }
            ]
        };

        console.log('Upload options:', JSON.stringify(options, null, 2));

        // Function to handle Cloudinary upload from buffer
        const uploadFromBuffer = (buffer) => {
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    options,
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload failed:', error);
                            return reject(new Error(`Upload failed: ${error.message}`));
                        }
                        if (!result || !result.secure_url) {
                            return reject(new Error('Invalid response from Cloudinary'));
                        }
                        console.log(`Upload successful: ${result.secure_url}`);
                        resolve(result);
                    }
                );
                
                // Create a readable stream from buffer
                const bufferStream = new Readable();
                bufferStream.push(buffer);
                bufferStream.push(null); // Signals end of stream
                
                // Pipe the buffer to Cloudinary
                bufferStream.pipe(uploadStream);
                
                // Handle stream errors
                bufferStream.on('error', (error) => {
                    console.error('Stream error:', error);
                    uploadStream.end();
                    reject(new Error(`Stream error: ${error.message}`));
                });
            });
        };

        // Function to handle upload from temp file
        const uploadFromTempFile = (filePath) => {
            console.log(`Uploading from temp file: ${filePath}`);
            return cloudinary.uploader.upload(filePath, options);
        };

        // Process upload based on available data
        try {
            let uploadPromise;
            
            if (hasData) {
                console.log('Uploading from memory buffer');
                uploadPromise = uploadFromBuffer(file.data);
            } else if (hasTempPath) {
                uploadPromise = uploadFromTempFile(file.tempFilePath);
            } else {
                throw new Error('No valid file data or temp file path available');
            }
            
            // Handle the upload result
            uploadPromise
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
        } catch (error) {
            console.error('Error during upload processing:', error);
            reject(error);
        }
    });
};