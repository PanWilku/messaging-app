import { type NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get token for authentication
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = token.id as string;

    // Get user's friends from database
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        friends: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return friends list
    return NextResponse.json({
      friends: user.friends,
      userId: user.id,
      userName: user.name,
    });
  } catch (error) {
    console.error("Error in GET /api/friendlist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
