import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { voteType } = body; // 'up' or 'down'

    if (voteType !== "up" && voteType !== "down") {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    // Check if the post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Check if user already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_targetType_targetId: {
          userId,
          targetType: "post",
          targetId: postId,
        },
      },
    });

    let diff = 0;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Double click: cancel the vote
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        diff = voteType === "up" ? -1 : 1;
      } else {
        // Change vote type
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { voteType },
        });
        diff = voteType === "up" ? 2 : -2;
      }
    } else {
      // Create new vote
      await prisma.vote.create({
        data: {
          userId,
          targetType: "post",
          targetId: postId,
          voteType,
        },
      });
      diff = voteType === "up" ? 1 : -1;
    }

    // Update upvote count on the post
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        upvotes: {
          increment: diff,
        },
      },
    });

    // Reward the author if it was an upvote (excluding self-upvotes)
    if (voteType === "up" && post.authorId !== userId && diff > 0) {
      await prisma.user.update({
        where: { id: post.authorId },
        data: {
          reputationScore: {
            increment: 2,
          },
        },
      });

      // Log reputation event for the author
      await prisma.reputationEvent.create({
        data: {
          userId: post.authorId,
          eventType: "RECEIVE_UPVOTE",
          points: 2,
          description: `Received upvote on post: "${post.title.substring(0, 30)}..."`,
        },
      });
    }

    return NextResponse.json({ success: true, upvotes: updatedPost.upvotes });
  } catch (error) {
    console.error("Vote API error:", error);
    return NextResponse.json({ error: "Failed to process vote" }, { status: 500 });
  }
}
