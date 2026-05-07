import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatAmount, formatDate, toIsoDateInput } from "@/lib/format";

export const dynamic = "force-dynamic";

type Search = { from?: string; to?: string };

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const params = await searchParams;
  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1);
  const defaultTo = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const from = params.from ? new Date(params.from) : defaultFrom;
  const to = params.to ? new Date(params.to) : defaultTo;
  const toEnd = new Date(to);
  toEnd.setDate(toEnd.getDate() + 1);

  const [cashBoxes, departments, txs] = await Promise.all([
    prisma.cashBox.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.department.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.transaction.findMany({
      where: { date: { gte: from, lt: toEnd } },
    }),
  ]);

  const byBox: Record<string, { income: bigint; expense: bigint }> = {};
  const byDept: Record<string, { income: bigint; expense: bigint }> = {};
  const byDeptBox: Record<string, Record<string, bigint>> = {};

  for (const t of txs) {
    if (!byBox[t.cashBoxId]) byBox[t.cashBoxId] = { income: 0n, expense: 0n };
    if (!byDept[t.departmentId])
      byDept[t.departmentId] = { income: 0n, expense: 0n };
    if (t.type === "income") {
      byBox[t.cashBoxId].income += t.amount;
      byDept[t.departmentId].income += t.amount;
    } else {
      byBox[t.cashBoxId].expense += t.amount;
      byDept[t.departmentId].expense += t.amount;
    }
    if (!byDeptBox[t.departmentId]) byDeptBox[t.departmentId] = {};
    const sign = t.type === "income" ? 1n : -1n;
    byDeptBox[t.departmentId][t.cashBoxId] =
      (byDeptBox[t.departmentId][t.cashBoxId] ?? 0n) + sign * t.amount;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Hisobotlar</h1>
        <Link
          href={`/api/export/transactions?from=${toIsoDateInput(from)}&to=${toIsoDateInput(to)}`}
          className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-700"
        >
          ⬇ Excel'ga yuklab olish
        </Link>
      </div>

      <form className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-slate-600 block">Sana (dan)</label>
          <input
            type="date"
            name="from"
            defaultValue={toIsoDateInput(from)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600 block">Sana (gacha)</label>
          <input
            type="date"
            name="to"
            defaultValue={toIsoDateInput(to)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-slate-900 text-white rounded-lg px-4 py-1.5 text-sm"
        >
          Hisoblash
        </button>
        <div className="text-sm text-slate-500 ml-auto">
          {formatDate(from)} — {formatDate(to)} ({txs.length} ta yozuv)
        </div>
      </form>

      <section>
        <h2 className="text-sm font-medium text-slate-600 mb-3">
          Kassalar bo'yicha
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Kassa</th>
                <th className="text-left px-3 py-2 font-medium">Valyuta</th>
                <th className="text-right px-3 py-2 font-medium">Kirim</th>
                <th className="text-right px-3 py-2 font-medium">Chiqim</th>
                <th className="text-right px-3 py-2 font-medium">Qoldiq</th>
              </tr>
            </thead>
            <tbody>
              {cashBoxes.map((box) => {
                const t = byBox[box.id] ?? { income: 0n, expense: 0n };
                const balance = t.income - t.expense;
                return (
                  <tr key={box.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium">{box.name}</td>
                    <td className="px-3 py-2 text-slate-500">{box.currency}</td>
                    <td className="px-3 py-2 text-right text-emerald-700">
                      +{formatAmount(t.income, box.currency)}
                    </td>
                    <td className="px-3 py-2 text-right text-rose-700">
                      −{formatAmount(t.expense, box.currency)}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {formatAmount(balance, box.currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-slate-600 mb-3">
          Bo'limlar bo'yicha
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Bo'lim</th>
                <th className="text-right px-3 py-2 font-medium">Kirim</th>
                <th className="text-right px-3 py-2 font-medium">Chiqim</th>
                <th className="text-right px-3 py-2 font-medium">Sof</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => {
                const t = byDept[dept.id] ?? { income: 0n, expense: 0n };
                const net = t.income - t.expense;
                return (
                  <tr key={dept.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium">{dept.name}</td>
                    <td className="px-3 py-2 text-right text-emerald-700">
                      +{formatAmount(t.income, "UZS")}
                    </td>
                    <td className="px-3 py-2 text-right text-rose-700">
                      −{formatAmount(t.expense, "UZS")}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {formatAmount(net, "UZS")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="px-3 py-2 text-xs text-slate-500 border-t border-slate-100">
            Eslatma: bo'limlar kesimi turli valyutalardagi yozuvlarni bir
            ko'rsatkichga yig'adi (UZS sifatida). Aniq qiymat uchun kassa
            bo'yicha hisobotni ko'ring.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-slate-600 mb-3">
          Bo'lim × Kassa (sof: kirim − chiqim)
        </h2>
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2 font-medium sticky left-0 bg-slate-50">
                  Bo'lim
                </th>
                {cashBoxes.map((box) => (
                  <th key={box.id} className="text-right px-3 py-2 font-medium">
                    {box.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 font-medium sticky left-0 bg-white">
                    {dept.name}
                  </td>
                  {cashBoxes.map((box) => {
                    const v = byDeptBox[dept.id]?.[box.id] ?? 0n;
                    return (
                      <td
                        key={box.id}
                        className={`px-3 py-2 text-right ${
                          v > 0n
                            ? "text-emerald-700"
                            : v < 0n
                              ? "text-rose-700"
                              : "text-slate-400"
                        }`}
                      >
                        {v === 0n ? "—" : formatAmount(v, box.currency)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
