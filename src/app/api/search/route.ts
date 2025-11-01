import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { SearchResult } from "@/lib/types";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  console.log("Session in recommendations route:", session);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";

  try {
    const searchResults = await prisma.user.findMany({
      where: {
        id: { notIn: [userId] },
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
      },
      take: 10,
    });

    const queryLower = query.toLowerCase();
    const resultsWithScore = searchResults.map((user) => {
      const nameLower = user.name.toLowerCase();
      let score = 0;

      if (nameLower.startsWith(queryLower)) {
        score = 2;
      } else if (nameLower.includes(queryLower)) {
        score = 1;
      }

      return { ...user, score };
    });

    resultsWithScore.sort((a, b) => b.score - a.score);

    // Remove the score from the response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sortedResults: SearchResult[] = resultsWithScore.map(
      ({ score, ...user }) => user
    );

    return NextResponse.json(sortedResults);
  } catch (error) {
    console.error("Error fetching search results:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
