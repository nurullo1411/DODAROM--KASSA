"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function login(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    throw new Error("Email va parol kiriting");
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    throw new Error("Email yoki parol noto'g'ri");
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    throw new Error("Email yoki parol noto'g'ri");
  }

  await setSessionCookie({
    userId: user.id,
    role: user.role as "admin" | "kassir" | "buxgalter",
  });
  redirect("/");
}
