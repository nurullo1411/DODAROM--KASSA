"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const DEFAULT_DEPARTMENTS = [
  { name: "Klentlar", code: 1 },
  { name: "Akfa", code: 5 },
  { name: "Oyna", code: 6 },
  { name: "Ofes", code: 3 },
  { name: "Bank", code: 7 },
  { name: "Oyliklar", code: 80 },
];

const DEFAULT_CASH_BOXES = [
  { name: "Naqd", currency: "UZS", kind: "cash" },
  { name: "Karta", currency: "UZS", kind: "card" },
  { name: "Bank", currency: "UZS", kind: "bank" },
  { name: "Dollar", currency: "USD", kind: "cash" },
];

export async function setupSystem(formData: FormData): Promise<void> {
  const existing = await prisma.user.count();
  if (existing > 0) {
    throw new Error("Tizim allaqachon o'rnatilgan");
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !fullName || password.length < 6) {
    throw new Error("To'liq ism, email va kamida 6 belgili parol kiriting");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: { email, fullName, passwordHash, role: "admin" },
    });
    for (const [i, d] of DEFAULT_DEPARTMENTS.entries()) {
      await tx.department.create({
        data: { ...d, sortOrder: i },
      });
    }
    for (const [i, c] of DEFAULT_CASH_BOXES.entries()) {
      await tx.cashBox.create({
        data: { ...c, sortOrder: i },
      });
    }
  });

  redirect("/login?setup=ok");
}
