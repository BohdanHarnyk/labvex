import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionId } = await params;
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userRole = session?.user?.role;

    // Only administrators can moderate offers
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const body = await req.json();
    const { status } = body; // 'APPROVED' or 'REJECTED'

    if (status !== "APPROVED" && status !== "REJECTED") {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: { status },
    });

    // If approved, reward the author with 100 reputation points for contributing a service
    if (status === "APPROVED") {
      await prisma.user.update({
        where: { id: updatedSubmission.authorId },
        data: {
          reputationScore: {
            increment: 100,
          },
        },
      });

      await prisma.reputationEvent.create({
        data: {
          userId: updatedSubmission.authorId,
          eventType: "MARKETPLACE_APPROVAL",
          points: 100,
          description: `Approved service: "${updatedSubmission.title}" (+100 REP)`,
        },
      });
    }

    return NextResponse.json({ success: true, submission: updatedSubmission });
  } catch (error) {
    console.error("Moderate submission API error:", error);
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 });
  }
}
