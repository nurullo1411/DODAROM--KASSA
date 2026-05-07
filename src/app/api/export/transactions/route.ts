import { NextRequest } from "next/server";
import ExcelJS from "exceljs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const fromStr = url.searchParams.get("from");
  const toStr = url.searchParams.get("to");

  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const from = fromStr ? new Date(fromStr) : defaultFrom;
  const to = toStr ? new Date(toStr) : defaultTo;
  const toEnd = new Date(to);
  toEnd.setDate(toEnd.getDate() + 1);

  const [cashBoxes, departments, txs] = await Promise.all([
    prisma.cashBox.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.department.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.transaction.findMany({
      where: { date: { gte: from, lt: toEnd } },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      include: { cashBox: true, department: true, createdBy: true },
    }),
  ]);

  const wb = new ExcelJS.Workbook();
  wb.creator = "Dodorom Kassa";
  wb.created = new Date();

  const sheet = wb.addWorksheet("Tranzaksiyalar");
  sheet.columns = [
    { header: "Sana", key: "date", width: 12 },
    { header: "Kassa", key: "cashBox", width: 14 },
    { header: "Valyuta", key: "currency", width: 10 },
    { header: "Bo'lim", key: "department", width: 16 },
    { header: "Tur", key: "type", width: 10 },
    { header: "Kirim", key: "income", width: 16 },
    { header: "Chiqim", key: "expense", width: 16 },
    { header: "Izoh", key: "note", width: 32 },
    { header: "Kim", key: "createdBy", width: 18 },
  ];
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" },
  };

  for (const t of txs) {
    sheet.addRow({
      date: formatDate(t.date),
      cashBox: t.cashBox.name,
      currency: t.cashBox.currency,
      department: t.department.name,
      type: t.type === "income" ? "Kirim" : "Chiqim",
      income: t.type === "income" ? Number(t.amount) : null,
      expense: t.type === "expense" ? Number(t.amount) : null,
      note: t.note ?? "",
      createdBy: t.createdBy.fullName,
    });
  }
  ["F", "G"].forEach((col) => {
    sheet.getColumn(col).numFmt = "#,##0";
  });

  const summarySheet = wb.addWorksheet("Xulosa");
  summarySheet.columns = [
    { header: "Kassa", key: "name", width: 16 },
    { header: "Valyuta", key: "currency", width: 10 },
    { header: "Kirim", key: "income", width: 18 },
    { header: "Chiqim", key: "expense", width: 18 },
    { header: "Qoldiq", key: "balance", width: 18 },
  ];
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" },
  };
  for (const box of cashBoxes) {
    let income = 0n;
    let expense = 0n;
    for (const t of txs) {
      if (t.cashBoxId !== box.id) continue;
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    summarySheet.addRow({
      name: box.name,
      currency: box.currency,
      income: Number(income),
      expense: Number(expense),
      balance: Number(income - expense),
    });
  }
  ["C", "D", "E"].forEach((col) => {
    summarySheet.getColumn(col).numFmt = "#,##0";
  });

  const deptSheet = wb.addWorksheet("Bolimlar");
  deptSheet.columns = [
    { header: "Bo'lim", key: "name", width: 18 },
    { header: "Kirim (UZS)", key: "income", width: 18 },
    { header: "Chiqim (UZS)", key: "expense", width: 18 },
    { header: "Sof", key: "net", width: 18 },
  ];
  deptSheet.getRow(1).font = { bold: true };
  deptSheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE2E8F0" },
  };
  for (const dept of departments) {
    let income = 0n;
    let expense = 0n;
    for (const t of txs) {
      if (t.departmentId !== dept.id) continue;
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    }
    deptSheet.addRow({
      name: dept.name,
      income: Number(income),
      expense: Number(expense),
      net: Number(income - expense),
    });
  }
  ["B", "C", "D"].forEach((col) => {
    deptSheet.getColumn(col).numFmt = "#,##0";
  });

  const buffer = await wb.xlsx.writeBuffer();
  const fromLabel = from.toISOString().slice(0, 10);
  const toLabel = to.toISOString().slice(0, 10);
  const filename = `kassa-${fromLabel}_${toLabel}.xlsx`;

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
