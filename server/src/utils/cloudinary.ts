import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const buildCloudinaryUploadOptions = (originalName: string) => {
  const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]+/g, '-').toLowerCase();
  return {
    resource_type: 'raw' as const,
    folder: 'journal-management-system/papers',
    public_id: `${Date.now()}-${sanitizedName}`,
  };
};

export const uploadBufferToCloudinary = async (buffer: Buffer, originalName: string) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary environment variables are not configured');
  }

  return new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      buildCloudinaryUploadOptions(originalName),
      (error, result) => {
        if (error || !result) {
          reject(error || new Error('Cloudinary upload failed'));
          return;
        }

        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });
};
