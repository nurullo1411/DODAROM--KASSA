"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function login(formData: FormData): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, error: "Email va parol kiriting" };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    return { ok: false, error: "Email yoki parol noto'g'ri" };
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return { ok: false, error: "Email yoki parol noto'g'ri" };
  }

  await setSessionCookie({
    userId: user.id,
    role: user.role as "admin" | "kassir" | "buxgalter",
  });
  redirect("/");
}
