"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { parseAmountInput } from "@/lib/format";

export async function createTransaction(formData: FormData): Promise<void> {
  const session = await requireSession();

  const cashBoxId = String(formData.get("cashBoxId") ?? "");
  const departmentId = String(formData.get("departmentId") ?? "");
  const type = String(formData.get("type") ?? "");
  const dateStr = String(formData.get("date") ?? "");
  const amountStr = String(formData.get("amount") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!cashBoxId || !departmentId) {
    throw new Error("Kassa va bo'limni tanlang");
  }
  if (type !== "income" && type !== "expense") {
    throw new Error("Tur noto'g'ri");
  }
  const amount = parseAmountInput(amountStr);
  if (!amount || amount <= 0n) {
    throw new Error("Summa noto'g'ri (faqat butun son)");
  }
  const date = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(date.getTime())) {
    throw new Error("Sana noto'g'ri");
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

export async function deleteTransaction(formData: FormData): Promise<void> {
  const session = await requireSession();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("ID kerak");

  const tx = await prisma.transaction.findUnique({ where: { id } });
  if (!tx) throw new Error("Topilmadi");

  if (session.role !== "admin" && tx.createdById !== session.userId) {
    throw new Error("Ruxsat yo'q");
  }

  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/transactions");
}
