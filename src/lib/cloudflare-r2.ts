import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Create S3 client configured for Cloudflare R2
const r2Client = new S3Client({
  region: process.env.CLOUDFLARE_R2_REGION || "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true, // Required for Cloudflare R2
});

async function getUniqueKey(prefix: string, fileName: string): Promise<string> {
  const dotIndex = fileName.lastIndexOf('.');
  const name = dotIndex !== -1 ? fileName.substring(0, dotIndex) : fileName;
  const ext = dotIndex !== -1 ? fileName.substring(dotIndex) : '';

  let key = `${prefix}/${fileName}`;
  let count = 0;

  while (true) {
    try {
      await r2Client.send(new HeadObjectCommand({
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
        Key: key,
      }));
      // If no error, file exists
      count++;
      key = `${prefix}/${name}_${count}${ext}`;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        // File does not exist, safe to use this key
        return key;
      }
      throw error; // Other error
    }
  }
}

export async function uploadVideoToR2(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const key = await getUniqueKey('videos', fileName);

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    Metadata: {
      uploadTime: new Date().toISOString(),
    },
  });

  await r2Client.send(command);

  // Return the public URL
  const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
  return publicUrl;
}

export async function generatePresignedUrl(
  fileName: string,
  mimeType: string,
  folder: 'images' | 'videos' = 'images'
): Promise<{ uploadUrl: string; publicUrl: string; key: string }> {
  const key = await getUniqueKey(folder, fileName);

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
    ContentType: mimeType,
  });

  // URL expires in 3600 seconds (1 hour)
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;

  return { uploadUrl, publicUrl, key };
}

export async function deleteVideoFromR2(fileKey: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: fileKey,
  });

  await r2Client.send(command);
}

export async function uploadImageToR2(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const key = await getUniqueKey('images', fileName);

  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    Metadata: {
      uploadTime: new Date().toISOString(),
    },
  });

  await r2Client.send(command);

  // Return the public URL
  const publicUrl = `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
  return publicUrl;
}