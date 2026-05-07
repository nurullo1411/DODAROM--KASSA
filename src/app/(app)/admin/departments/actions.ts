"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";

export async function createDepartment(formData: FormData): Promise<void> {
  await requireRole("admin");
  const name = String(formData.get("name") ?? "").trim();
  const codeStr = String(formData.get("code") ?? "").trim();
  if (!name) throw new Error("Nom kiriting");
  let code: number | null = null;
  if (codeStr) {
    const parsed = Number(codeStr);
    if (!Number.isInteger(parsed) || parsed < 0)
      throw new Error("Kod butun musbat son bo'lishi kerak");
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
}

export async function toggleDepartment(formData: FormData): Promise<void> {
  await requireRole("admin");
  const id = String(formData.get("id") ?? "");
  const dept = await prisma.department.findUnique({ where: { id } });
  if (!dept) throw new Error("Topilmadi");
  await prisma.department.update({
    where: { id },
    data: { isActive: !dept.isActive },
  });
  revalidatePath("/admin/departments");
}
