import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { email, name, password, type } = await request.json();

    // Validation
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // For regular users, email and password are required
    if (type === "user" || !type) {
      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required for user accounts" },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create regular user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          passwordHash: hashedPassword,
          type: "user",
        },
      });

      return NextResponse.json(
        {
          message: "User created successfully",
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            type: user.type,
          },
        },
        { status: 201 }
      );
    }
    // For guest users
    else if (type === "guest") {
      // Guests don't need email or password
      const guest = await prisma.user.create({
        data: {
          name,
          type: "guest",
          // email and passwordHash are optional, so we omit them
        },
      });

      return NextResponse.json(
        {
          message: "Guest account created successfully",
          user: {
            id: guest.id,
            name: guest.name,
            type: guest.type,
          },
        },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: "Invalid account type" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
