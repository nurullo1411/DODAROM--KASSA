"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export type Result =
  | { ok: true; password?: string }
  | { ok: false; error: string };

const ROLES = ["admin", "kassir", "buxgalter"] as const;

export async function createUser(formData: FormData): Promise<Result> {
  await requireRole("admin");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email) return { ok: false, error: "Ism va email kiriting" };
  if (!ROLES.includes(role as (typeof ROLES)[number]))
    return { ok: false, error: "Rol noto'g'ri" };
  if (password.length < 6)
    return { ok: false, error: "Parol kamida 6 belgi bo'lishi kerak" };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "Bu email allaqachon mavjud" };

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { fullName, email, passwordHash, role },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function toggleUser(formData: FormData): Promise<Result> {
  const session = await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  if (id === session.userId)
    return { ok: false, error: "O'zingizni o'chira olmaysiz" };
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { ok: false, error: "Topilmadi" };
  await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function resetPassword(formData: FormData): Promise<Result> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (password.length < 6)
    return { ok: false, error: "Parol kamida 6 belgi bo'lishi kerak" };
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return { ok: false, error: "Topilmadi" };
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.update({ where: { id }, data: { passwordHash } });
  revalidatePath("/admin/users");
  return { ok: true };
}
