"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export type Result = { ok: true } | { ok: false; error: string };

export async function createCashBox(formData: FormData): Promise<Result> {
  await requireRole("admin");
  const name = String(formData.get("name") ?? "").trim();
  const currency = String(formData.get("currency") ?? "UZS");
  const kind = String(formData.get("kind") ?? "cash");
  if (!name) return { ok: false, error: "Nom kiriting" };
  if (!["UZS", "USD", "RUB", "EUR"].includes(currency))
    return { ok: false, error: "Valyuta noto'g'ri" };
  if (!["cash", "card", "bank"].includes(kind))
    return { ok: false, error: "Tur noto'g'ri" };

  const max = await prisma.cashBox.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  await prisma.cashBox.create({
    data: { name, currency, kind, sortOrder: (max?.sortOrder ?? 0) + 1 },
  });
  revalidatePath("/admin/cashboxes");
  return { ok: true };
}

export async function toggleCashBox(formData: FormData): Promise<Result> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const box = await prisma.cashBox.findUnique({ where: { id } });
  if (!box) return { ok: false, error: "Topilmadi" };
  await prisma.cashBox.update({
    where: { id },
    data: { isActive: !box.isActive },
  });
  revalidatePath("/admin/cashboxes");
  return { ok: true };
}
