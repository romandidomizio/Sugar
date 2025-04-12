// src/services/photoService.ts

import axios from 'axios';

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload';
const UPLOAD_PRESET = 'YOUR_UNSIGNED_UPLOAD_PRESET';

export async function uploadToCloudinary(photoUri: string) {
  const data = new FormData();

  data.append('file', {
    uri: photoUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  } as any);
  data.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await axios.post(CLOUDINARY_URL, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('[PhotoService] Cloudinary upload success:', response.data.secure_url);
    return response.data.secure_url;
  } catch (error: any) {
    console.error('[PhotoService] Cloudinary upload error:', error.response?.data || error.message);
    throw new Error('Failed to upload image to Cloudinary');
  }
}
