"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { parseAmountInput } from "@/lib/format";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function createTransaction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await requireSession();

  const cashBoxId = String(formData.get("cashBoxId") ?? "");
  const departmentId = String(formData.get("departmentId") ?? "");
  const type = String(formData.get("type") ?? "");
  const dateStr = String(formData.get("date") ?? "");
  const amountStr = String(formData.get("amount") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!cashBoxId || !departmentId) {
    return { ok: false, error: "Kassa va bo'limni tanlang" };
  }
  if (type !== "income" && type !== "expense") {
    return { ok: false, error: "Tur noto'g'ri" };
  }
  const amount = parseAmountInput(amountStr);
  if (!amount || amount <= 0n) {
    return { ok: false, error: "Summa noto'g'ri (faqat butun son)" };
  }
  const date = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "Sana noto'g'ri" };
  }

  await prisma.transaction.create({
    data: {
      date,
      cashBoxId,
      departmentId,
      type,
      amount,
      note: note || null,
      createdById: session.userId,
    },
  });

  revalidatePath("/");
  revalidatePath("/transactions");
  redirect("/transactions");
}

export async function deleteTransaction(formData: FormData): Promise<ActionResult> {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "ID kerak" };

  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) return { ok: false, error: "Topilmadi" };

  if (session.role !== "admin" && tx.createdById !== session.userId) {
    return { ok: false, error: "Ruxsat yo'q" };
  }

  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/transactions");
  return { ok: true };
}
