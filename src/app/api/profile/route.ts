import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type UserUpdateData = {
  name?: string;
  email?: string;
  avatar?: string;
  description?: string;
};

type GuestUpdateData = {
  name?: string;
  avatar?: string;
  description?: string;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userType = session.user.type;

    let profile;
    if (userType === "user") {
      profile = await prisma.user.findUnique({
        where: { id: parseInt(userId) },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } else {
      profile = await prisma.guest.findUnique({
        where: { id: parseInt(userId) },
        select: {
          id: true,
          name: true,
          avatar: true,
          description: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ profile, type: userType });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userType = session.user.type;
    const body = await req.json();

    let updatedProfile;

    if (userType === "user") {
      const updateData: UserUpdateData = {};

      if (body.name !== undefined) updateData.name = body.name;
      if (body.email !== undefined) {
        // Check if email is already taken
        const existing = await prisma.user.findFirst({
          where: {
            email: body.email,
            id: { not: parseInt(userId) },
          },
        });
        if (existing) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 400 }
          );
        }
        updateData.email = body.email;
      }
      if (body.avatar !== undefined) updateData.avatar = body.avatar;
      if (body.description !== undefined)
        updateData.description = body.description;

      updatedProfile = await prisma.user.update({
        where: { id: parseInt(userId) },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          description: true,
          updatedAt: true,
        },
      });
    } else {
      const updateData: GuestUpdateData = {};

      if (body.name !== undefined) updateData.name = body.name;
      if (body.avatar !== undefined) updateData.avatar = body.avatar;
      if (body.description !== undefined)
        updateData.description = body.description;

      updatedProfile = await prisma.guest.update({
        where: { id: parseInt(userId) },
        data: updateData,
        select: {
          id: true,
          name: true,
          avatar: true,
          description: true,
          updatedAt: true,
        },
      });
    }

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
