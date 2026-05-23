import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id;
    // @ts-ignore
    const userRole = session?.user?.role;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter"); // 'all' or 'my'

    // If user is admin and requests 'all' (moderation queue)
    if (userRole === "ADMIN" && filter !== "my") {
      const submissions = await prisma.submission.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: {
            select: {
              username: true,
              displayName: true,
              role: true,
            },
          },
        },
      });
      return NextResponse.json(submissions);
    }

    // Default: return only user's own submissions
    const submissions = await prisma.submission.findMany({
      where: {
        authorId: userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Fetch submissions API error:", error);
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, category, link, data } = body;

    if (!title || !category) {
      return NextResponse.json({ error: "Title and category are required" }, { status: 400 });
    }

    const submission = await prisma.submission.create({
      data: {
        authorId: userId,
        title,
        category,
        link: link || null,
        status: "PENDING",
        data: data || {},
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Create submission API error:", error);
    return NextResponse.json({ error: "Failed to submit offer" }, { status: 500 });
  }
}
