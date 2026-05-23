import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    // @ts-ignore
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role, interests, displayName, bio, twitter, github, orcid } = body;

    // Build bio description with additional information if available
    let finalBio = bio || "";
    if (orcid) {
      finalBio += `\nORCID: ${orcid}`;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        role: role || "CITIZEN_EXPLORER",
        interests: interests || [],
        displayName: displayName || undefined,
        bio: finalBio,
        isOnboarded: true,
        reputationScore: 1200, // Starting reputation from our current setup
      },
    });

    // Create a reputation event for onboarding
    await prisma.reputationEvent.create({
      data: {
        userId: user.id,
        eventType: "ONBOARDING",
        points: 1200,
        description: `Onboarded as ${role.replace("_", " ").toLowerCase()}`,
      },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Onboarding API error:", error);
    return NextResponse.json({ error: "Onboarding failed" }, { status: 500 });
  }
}
