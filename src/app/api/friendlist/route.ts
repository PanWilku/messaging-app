import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const userType = session.user.type;

    // Only registered users can have friends
    if (userType !== "user") {
      return NextResponse.json({
        friends: [],
        userId: userId,
        userName: session.user.name,
        message: "Guest users cannot have friends",
      });
    }

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
