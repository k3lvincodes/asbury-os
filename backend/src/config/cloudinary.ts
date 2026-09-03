import { v2 as cloudinary } from 'cloudinary';

export function configureCloudinary(
  cloudName: string,
  apiKey: string,
  apiSecret: string
) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
  
  return cloudinary;
}

// Upload signed agreement PDF
export async function uploadAgreementPDF(
  buffer: Buffer,
  bookingNumber: string
): Promise<string> {
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'asbury-agreements',
        public_id: `agreement-${bookingNumber}`,
        resource_type: 'raw',    // PDFs use 'raw'
        format: 'pdf',
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });

  return (result as any).secure_url;
}

export default cloudinary;
