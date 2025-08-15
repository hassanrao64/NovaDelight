import { Cloudinary as CloudinaryCore } from 'cloudinary-core';

// Your Cloudinary configuration
const cloudinaryConfig = {
  cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.REACT_APP_CLOUDINARY_API_KEY,
  apiSecret: process.env.REACT_APP_CLOUDINARY_API_SECRET,
  uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
};

export const cloudinary = new CloudinaryCore({
  cloud: {
    cloudName: cloudinaryConfig.cloudName
  }
});

/**
 * Upload an image to Cloudinary
 * @param {File} file - The file to upload
 * @param {Function} progressCallback - Optional callback for upload progress
 * @returns {Promise<string>} - URL of the uploaded image
 */
export const uploadToCloudinary = async (file, progressCallback = () => {}) => {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`;
    
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    
    xhr.open('POST', url, true);
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded * 100) / e.total);
        progressCallback(progress);
      }
    };
    
    xhr.onload = () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        reject(new Error('Upload failed'));
      }
    };
    
    xhr.onerror = () => {
      reject(new Error('Upload failed'));
    };
    
    // Add file to form data
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', 'chat_images');
    
    // Add timestamp and eager transformations if needed
    formData.append('timestamp', Date.now() / 1000);
    
    // Send the form data
    xhr.send(formData);
  });
};

export default cloudinaryConfig;