"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface ProfileResult {
  success: boolean;
  error?: string;
}

export interface ProfileData {
  id: string;
  email: string;
  name: string | null;
  bio: string | null;
  createdAt: Date;
}

export async function getProfile(): Promise<ProfileData | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error("Get profile error:", error);
    return null;
  }
}

export async function updateProfile(
  name: string,
  bio: string
): Promise<ProfileResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: name.trim() || null,
        bio: bio.trim() || null,
      },
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}
