"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export type Result = { ok: true } | { ok: false; error: string };

export async function createDepartment(formData: FormData): Promise<Result> {
  await requireRole("admin");
  const name = String(formData.get("name") ?? "").trim();
  const codeStr = String(formData.get("code") ?? "").trim();
  if (!name) return { ok: false, error: "Nom kiriting" };
  let code: number | null = null;
  if (codeStr) {
    const parsed = Number(codeStr);
    if (!Number.isInteger(parsed) || parsed < 0)
      return { ok: false, error: "Kod butun musbat son bo'lishi kerak" };
    code = parsed;
  }
  const max = await prisma.department.findFirst({
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  await prisma.department.create({
    data: { name, code, sortOrder: (max?.sortOrder ?? 0) + 1 },
  });
  revalidatePath("/admin/departments");
  return { ok: true };
}

export async function toggleDepartment(formData: FormData): Promise<Result> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) return { ok: false, error: "Topilmadi" };
  await prisma.department.update({
    where: { id },
    data: { isActive: !dept.isActive },
  });
  revalidatePath("/admin/departments");
  return { ok: true };
}
