import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

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

export async function uploadVideoToR2(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const key = `videos/${Date.now()}-${fileName}`;
  
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
  const key = `images/${Date.now()}-${fileName}`;
  
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