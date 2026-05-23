import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : 10;

    const leaderboard = await prisma.user.findMany({
      where: {
        isOnboarded: true,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        role: true,
        reputationScore: true,
        bio: true,
        avatarUrl: true,
      },
      orderBy: {
        reputationScore: "desc",
      },
      take: Math.min(100, limit),
    });

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
