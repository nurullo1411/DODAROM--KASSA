"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

const ROLES = ["admin", "kassir", "buxgalter"] as const;

export async function createUser(formData: FormData): Promise<void> {
  await requireRole("admin");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email) throw new Error("Ism va email kiriting");
  if (!ROLES.includes(role as (typeof ROLES)[number]))
    throw new Error("Rol noto'g'ri");
  if (password.length < 6)
    throw new Error("Parol kamida 6 belgi bo'lishi kerak");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Bu email allaqachon mavjud");

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { fullName, email, passwordHash, role },
  });
  revalidatePath("/admin/users");
}

export async function toggleUser(formData: FormData): Promise<void> {
  const session = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  if (id === session.userId)
    throw new Error("O'zingizni o'chira olmaysiz");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Topilmadi");
  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });
  revalidatePath("/admin/users");
}

export async function resetPassword(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 6)
    throw new Error("Parol kamida 6 belgi bo'lishi kerak");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("Topilmadi");
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  revalidatePath("/admin/users");
}
