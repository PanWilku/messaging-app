import dotenv from "dotenv";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REGION = process.env.AWS_REGION || "ap-southeast-2";
const BUCKET = process.env.AWS_S3_BUCKET_NAME;
if (!BUCKET) {
  console.error("AWS_S3_BUCKET_NAME is not set in environment");
  process.exit(1);
}

const s3 = new S3Client({ region: REGION }); // SDK will use env or shared credentials if present

async function uploadFile() {
  try {
    const filePath = path.join(__dirname, "public", "next.svg");
    if (!fs.existsSync(filePath)) {
      console.error("File not found:", filePath);
      process.exit(1);
    }

    const fileBuffer = fs.readFileSync(filePath);

    // Save under the existing "messaging-app" prefix and sanitize the filename
    const originalName = path.basename(filePath);
    const safeName = originalName.replace(/[^\w.-]/g, "_"); // replace spaces/unsafe chars
    const key = `messaging-app/${Date.now()}-${safeName}`;

    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: "image/svg+xml",
      // Do NOT set ACL when your bucket uses "bucket owner enforced"
    });

    await s3.send(cmd);

    // encodeURIComponent the key for a valid URL
    const url = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURIComponent(key)}`;
    console.log("Upload successful. File URL:");
    console.log(url);
  } catch (err) {
    console.error("Upload failed:", err);
    process.exit(1);
  }
}

uploadFile();