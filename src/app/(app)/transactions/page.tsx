import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatAmount, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    cashBox?: string;
    dept?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const params = await searchParams;
  const where: Record<string, unknown> = {};
  if (params.cashBox) where.cashBoxId = params.cashBox;
  if (params.dept) where.departmentId = params.dept;
  if (params.from || params.to) {
    const date: Record<string, Date> = {};
    if (params.from) date.gte = new Date(params.from);
    if (params.to) {
      const end = new Date(params.to);
      end.setDate(end.getDate() + 1);
      date.lt = end;
    }
    where.date = date;
  }

  const [txs, cashBoxes, departments] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 200,
      include: { cashBox: true, department: true, createdBy: true },
    }),
    prisma.cashBox.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.department.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const totals = txs.reduce(
    (acc, t) => {
      const key = t.cashBox.currency;
      if (!acc[key]) acc[key] = { income: 0n, expense: 0n };
      if (t.type === "income") acc[key].income += t.amount;
      else acc[key].expense += t.amount;
      return acc;
    },
    {} as Record<string, { income: bigint; expense: bigint }>,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tranzaksiyalar</h1>
        <Link
          href="/transactions/new"
          className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-800"
        >
          + Yangi
        </Link>
      </div>

      <form className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-slate-600">Kassa</label>
          <select
            name="cashBox"
            defaultValue={params.cashBox ?? ""}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
          >
            <option value="">Hammasi</option>
            {cashBoxes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600">Bo'lim</label>
          <select
            name="dept"
            defaultValue={params.dept ?? ""}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
          >
            <option value="">Hammasi</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600">Sana (dan)</label>
          <input
            type="date"
            name="from"
            defaultValue={params.from ?? ""}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600">Sana (gacha)</label>
          <input
            type="date"
            name="to"
            defaultValue={params.to ?? ""}
            className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm"
          />
        </div>
        <div className="sm:col-span-4 flex gap-2">
          <button
            type="submit"
            className="bg-slate-900 text-white rounded-lg px-4 py-1.5 text-sm"
          >
            Filtrlash
          </button>
          <Link
            href="/transactions"
            className="border border-slate-300 rounded-lg px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            Tozalash
          </Link>
        </div>
      </form>

      {Object.keys(totals).length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="text-sm text-slate-600 mb-2">Tanlovga ko'ra jami</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(totals).map(([cur, t]) => (
              <div key={cur} className="text-sm">
                <div className="text-slate-500 mb-1">{cur}</div>
                <div className="flex justify-between">
                  <span className="text-emerald-700">
                    +{formatAmount(t.income, cur)}
                  </span>
                  <span className="text-rose-700">
                    −{formatAmount(t.expense, cur)}
                  </span>
                </div>
                <div className="font-semibold mt-1">
                  Qoldiq: {formatAmount(t.income - t.expense, cur)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {txs.length === 0 ? (
        <div className="text-center py-12 bg-white border border-dashed border-slate-300 rounded-xl text-slate-500">
          Hech qanday tranzaksiya topilmadi.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-3 py-2 font-medium">Sana</th>
                <th className="text-left px-3 py-2 font-medium">Kassa</th>
                <th className="text-left px-3 py-2 font-medium">Bo'lim</th>
                <th className="text-left px-3 py-2 font-medium">Izoh</th>
                <th className="text-left px-3 py-2 font-medium">Kim</th>
                <th className="text-right px-3 py-2 font-medium">Summa</th>
              </tr>
            </thead>
            <tbody>
              {txs.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-3 py-2">{t.cashBox.name}</td>
                  <td className="px-3 py-2">{t.department.name}</td>
                  <td className="px-3 py-2 text-slate-600">{t.note ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-500">
                    {t.createdBy.fullName}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-medium whitespace-nowrap ${
                      t.type === "income"
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {t.type === "income" ? "+" : "−"}
                    {formatAmount(t.amount, t.cashBox.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
