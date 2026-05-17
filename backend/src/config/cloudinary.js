import { v2 as cloudinary } from 'cloudinary';

const getCloudinaryEnv = () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.cloud_name,
  apiKey: process.env.CLOUDINARY_API_KEY || process.env.cloud_api_key,
  apiSecret: process.env.CLOUDINARY_API_SECRET || process.env.cloud_api_secret
});

export const isCloudinaryConfigured = () => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryEnv();
  return Boolean(cloudName && apiKey && apiSecret);
};

export const getConfiguredCloudinary = () => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryEnv();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  });

  return cloudinary;
};

export default cloudinary;
