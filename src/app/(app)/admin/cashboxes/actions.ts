"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function createCashBox(formData: FormData): Promise<void> {
  await requireRole("admin");
  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "UZS");
  const kind = String(formData.get("kind") ?? "cash");
  if (!name) throw new Error("Nom kiriting");
  if (!["UZS", "USD", "RUB", "EUR"].includes(currency))
    throw new Error("Valyuta noto'g'ri");
  if (!["cash", "card", "bank"].includes(kind))
    throw new Error("Tur noto'g'ri");

  const max = await prisma.cashBox.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  await prisma.cashBox.create({
    data: { name, currency, kind, sortOrder: (max?.sortOrder ?? 0) + 1 },
  });
  revalidatePath("/admin/cashboxes");
}

export async function toggleCashBox(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const box = await prisma.cashBox.findUnique({ where: { id } });
  if (!box) throw new Error("Topilmadi");
  await prisma.cashBox.update({
    where: { id },
    data: { isActive: !box.isActive },
  });
  revalidatePath("/admin/cashboxes");
}
