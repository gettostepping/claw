import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import * as dotenv from "dotenv";

dotenv.config();

async function fixCors() {
    const r2Client = new S3Client({
        region: process.env.CLOUDFLARE_R2_REGION || "auto",
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
        credentials: {
            accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || "",
        },
        forcePathStyle: true,
    });

    const corsConfiguration = {
        CORSRules: [
            {
                AllowedHeaders: ["*"],
                AllowedMethods: ["PUT", "GET", "POST", "HEAD"],
                AllowedOrigins: ["*"], // You can restrict this to your domain later
                ExposeHeaders: [],
                MaxAgeSeconds: 3000,
            },
        ],
    };

    try {
        console.log("Setting CORS configuration for bucket:", process.env.CLOUDFLARE_R2_BUCKET_NAME);
        await r2Client.send(
            new PutBucketCorsCommand({
                Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
                CORSConfiguration: corsConfiguration,
            })
        );
        console.log("✅ CORS configuration set successfully!");
    } catch (error) {
        console.error("❌ Failed to set CORS configuration:", error);
    }
}

fixCors();
