import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);

    // fetch current avatar so we can delete it later
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });
    const previousAvatar = existingUser?.avatar ?? null;

    const formData = await request.formData();
    const avatarFile = formData.get("avatar") as File | null;

    if (!avatarFile || typeof (avatarFile as any).arrayBuffer !== "function") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate basic file type/size (optional)
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
    ];
    if (avatarFile.type && !allowed.includes(avatarFile.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    const maxSize = 5 * 1024 * 1024;
    if (avatarFile.size && avatarFile.size > maxSize) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const REGION = process.env.AWS_REGION || "ap-southeast-2";
    const BUCKET = process.env.AWS_S3_BUCKET_NAME;
    if (!BUCKET) {
      return NextResponse.json(
        { error: "Bucket not configured" },
        { status: 500 }
      );
    }

    const arrayBuffer = await avatarFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // sanitize filename and build key under existing "messaging-app" prefix
    const originalName = avatarFile.name || `avatar-${Date.now()}`;
    const safeName = originalName.replace(/[^\w.-]/g, "_");
    const key = `messaging-app/avatars/${userId}/${Date.now()}-${safeName}`;

    const s3 = new S3Client({ region: REGION });
    const put = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: avatarFile.type || "application/octet-stream",
    });

    await s3.send(put);

    // Build URL by encoding each segment to preserve slashes
    const encodedKey = key.split("/").map(encodeURIComponent).join("/");
    const avatarUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodedKey}`;

    console.log("Generated avatar URL:", avatarUrl);
    console.log("S3 Key:", key);

    // Attempt to delete previous avatar from the same bucket (if applicable)
    if (previousAvatar) {
      try {
        const prevUrl = new URL(previousAvatar);
        const prevHost = prevUrl.hostname;
        // Only attempt delete if the previous object's hostname references the same bucket
        const bucketHost1 = `${BUCKET}.s3.${REGION}.amazonaws.com`;
        const bucketHost2 = `${BUCKET}.s3.amazonaws.com`;
        if (
          prevHost === bucketHost1 ||
          prevHost === bucketHost2 ||
          prevHost.includes(`${BUCKET}.s3.`)
        ) {
          const prevKey = decodeURIComponent(
            prevUrl.pathname.replace(/^\//, "")
          );
          // don't delete if it's the same key we just uploaded
          if (prevKey && prevKey !== key) {
            try {
              await s3.send(
                new DeleteObjectCommand({
                  Bucket: BUCKET,
                  Key: prevKey,
                })
              );
              console.info("Deleted previous avatar from S3:", prevKey);
            } catch (delErr) {
              console.warn("Failed to delete previous avatar from S3:", delErr);
              // non-fatal — continue
            }
          }
        }
      } catch (parseErr) {
        console.warn(
          "Could not parse previous avatar URL, skipping delete:",
          parseErr
        );
      }
    }

    // Persist avatar URL to database
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    console.log("Avatar URL saved to database for user:", userId);

    return NextResponse.json({ avatarUrl }, { status: 200 });
  } catch (err) {
    console.error("changeavatar upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
