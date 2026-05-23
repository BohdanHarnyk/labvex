import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Simple DeSci compliance list of substances to trigger the CAS Screening flag
const RESTRICTED_SUBSTANCES = [
  "dimethylmercury",
  "sarin",
  "vx agent",
  "ricin",
  "botulinum",
  "plutonium",
  "uranium-235",
  "polonium-210",
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");

    const where: any = {};
    if (category && category !== "ALL" && category !== "All") {
      where.category = category;
    }
    if (tag) {
      where.tags = {
        has: tag,
      };
    }

    const posts = await prisma.post.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            username: true,
            displayName: true,
            role: true,
            reputationScore: true,
            avatarUrl: true,
          },
        },
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error("Fetch posts API error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
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
    const { title, content, category, tags } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    // Process tags array
    const tagsArray = Array.isArray(tags) 
      ? tags 
      : tags 
        ? tags.split(",").map((t: string) => t.trim().toLowerCase().replace("#", "")).filter((t: string) => t.length > 0)
        : [];

    // Compliance Check: simple check for restricted substances to toggle casFlag
    const fullText = `${title} ${content}`.toLowerCase();
    const hasRestrictedSubstance = RESTRICTED_SUBSTANCES.some(substance => 
      fullText.includes(substance)
    );

    // Generate Vexy AI Summary simulation if needed
    let aiSummary = null;
    if (content.length > 100) {
      aiSummary = `Vexy AI parsed this research paper. Key hypothesis: ${title.substring(0, 50)}... The author proposes a new methodology in category ${category || "General"}. Telemetry evaluation recommended.`;
    }

    // Create post in DB
    const post = await prisma.post.create({
      data: {
        authorId: userId,
        title,
        content,
        category: category || "General",
        tags: tagsArray,
        casFlag: hasRestrictedSubstance,
        aiSummary,
      },
    });

    // Reward user with 50 reputation points
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        reputationScore: {
          increment: 50,
        },
      },
    });

    // Log the reputation event
    await prisma.reputationEvent.create({
      data: {
        userId: userId,
        eventType: "PUBLISH_POST",
        points: 50,
        description: `Published post: "${title.substring(0, 30)}..."`,
      },
    });

    return NextResponse.json({ success: true, post, userReputation: user.reputationScore });
  } catch (error) {
    console.error("Create post API error:", error);
    return NextResponse.json({ error: "Failed to publish post" }, { status: 500 });
  }
}
