"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function addLink(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return { error: "Not authenticated" }

  const title = formData.get("title") as string
  const url = formData.get("url") as string

  if (!title || !url) return { error: "Missing fields" }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true }
  })

  if (!user?.profile) return { error: "Profile not found" }

  await prisma.link.create({
    data: {
      profileId: user.profile.id,
      title,
      url,
      order: 0, // Default order, ideally fetch max order + 1
    }
  })

  revalidatePath("/dashboard/edit")
  revalidatePath(`/@${session.user.name}`) // or username
  return { success: true }
}

export async function deleteLink(linkId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return { error: "Not authenticated" }

  // Verify ownership
  const link = await prisma.link.findUnique({
    where: { id: linkId },
    include: { profile: { include: { user: true } } }
  })

  if (!link || link.profile.user.email !== session.user.email) {
    return { error: "Unauthorized" }
  }

  await prisma.link.delete({
    where: { id: linkId }
  })

  revalidatePath("/dashboard/edit")
  revalidatePath(`/@${session.user.name}`)
  return { success: true }
}
