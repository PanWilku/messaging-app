import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { ReccomendationsData } from "@/lib/types";

export async function GET() {
  const session = await getServerSession(authOptions);
  console.log("Session in recommendations route:", session);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);

  //if user is guest, return random users
  if (session.user.type === "guest") {
    try {
      const randomUsers = await prisma.user.findMany({
        where: {
          id: {
            notIn: [userId],
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
        take: 10,
      });

      return NextResponse.json(randomUsers);
    } catch (error) {
      console.error("Error fetching random users:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  try {
    // Step 1: Get the current user with their friends
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        friends: {
          select: { id: true },
        },
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Extract friend IDs
    const friendIds = currentUser.friends.map((f) => f.id);

    // Step 2: Find friends of friends
    const friendsOfFriends = await prisma.user.findMany({
      where: {
        id: {
          notIn: [userId, ...friendIds], // Exclude yourself and existing friends
        },
        friends: {
          some: {
            id: {
              in: friendIds, // Must be friends with at least one of YOUR friends
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        friends: {
          where: {
            id: {
              in: friendIds, // Only include YOUR friends in this relation
            },
          },
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 50, // Get more than we need for sorting
    });

    // Step 3: Calculate mutual friend count and sort
    let recommendations: ReccomendationsData[] = friendsOfFriends
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        mutualFriendCount: user.friends.length,
        mutualFriends: user.friends,
      }))
      .sort((a, b) => b.mutualFriendCount - a.mutualFriendCount)
      .slice(0, 10);

    // Step 4: If we don't have enough recommendations, add random users
    if (recommendations.length < 10) {
      const excludedIds = [
        userId,
        ...friendIds,
        ...recommendations.map((r) => r.id),
      ];

      const randomUsers = await prisma.user.findMany({
        where: {
          id: {
            notIn: excludedIds, // Exclude yourself, friends, and already recommended
          },
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
        take: 10 - recommendations.length, // Fill up to 10 total
      });

      // Add random users with mutualFriendCount = 0
      const randomRecommendations: ReccomendationsData[] = randomUsers.map(
        (user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          mutualFriendCount: 0,
          mutualFriends: [],
        })
      );

      // Combine both lists
      recommendations = [...recommendations, ...randomRecommendations];
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
