import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatAmount, formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [cashBoxes, todayTx, monthTx, recent] = await Promise.all([
    prisma.cashBox.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.transaction.findMany({
      where: { date: { gte: startOfDay } },
      include: { cashBox: true, department: true },
    }),
    prisma.transaction.findMany({
      where: { date: { gte: startOfMonth, lt: endOfMonth } },
      include: { cashBox: true },
    }),
    prisma.transaction.findMany({
      orderBy: { date: "desc" },
      take: 8,
      include: { cashBox: true, department: true, createdBy: true },
    }),
  ]);

  const todayByBox = aggregateByBox(todayTx, cashBoxes);
  const monthByBox = aggregateByBox(monthTx, cashBoxes);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <section>
        <h2 className="text-sm font-medium text-slate-600 mb-3">
          Bugun ({formatDate(now)})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cashBoxes.map((box) => {
            const t = todayByBox[box.id] ?? { income: 0n, expense: 0n };
            return (
              <SummaryCard
                key={box.id}
                title={box.name}
                currency={box.currency}
                income={t.income}
                expense={t.expense}
              />
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-slate-600 mb-3">
          Joriy oy ({now.toLocaleDateString("uz-UZ", { month: "long", year: "numeric" })})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cashBoxes.map((box) => {
            const t = monthByBox[box.id] ?? { income: 0n, expense: 0n };
            return (
              <SummaryCard
                key={box.id}
                title={box.name}
                currency={box.currency}
                income={t.income}
                expense={t.expense}
              />
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-slate-600">
            Oxirgi tranzaksiyalar
          </h2>
          <Link
            href="/transactions"
            className="text-sm text-slate-700 hover:text-slate-900"
          >
            Barchasi →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-12 bg-white border border-dashed border-slate-300 rounded-xl text-slate-500">
            Hali tranzaksiya yo'q.{" "}
            <Link
              href="/transactions/new"
              className="text-slate-900 underline underline-offset-2"
            >
              Birinchisini qo'shing
            </Link>
            .
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
                  <th className="text-right px-3 py-2 font-medium">Summa</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100">
                    <td className="px-3 py-2">{formatDate(t.date)}</td>
                    <td className="px-3 py-2">{t.cashBox.name}</td>
                    <td className="px-3 py-2">{t.department.name}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {t.note ?? "—"}
                    </td>
                    <td
                      className={`px-3 py-2 text-right font-medium ${
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
      </section>
    </div>
  );
}

function aggregateByBox(
  txs: { cashBoxId: string; type: string; amount: bigint }[],
  _boxes: { id: string }[],
) {
  const map: Record<string, { income: bigint; expense: bigint }> = {};
  for (const t of txs) {
    if (!map[t.cashBoxId]) map[t.cashBoxId] = { income: 0n, expense: 0n };
    if (t.type === "income") map[t.cashBoxId].income += t.amount;
    else map[t.cashBoxId].expense += t.amount;
  }
  return map;
}

function SummaryCard({
  title,
  currency,
  income,
  expense,
}: {
  title: string;
  currency: string;
  income: bigint;
  expense: bigint;
}) {
  const balance = income - expense;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="text-sm text-slate-600 mb-2">{title}</div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Kirim</span>
          <span className="text-emerald-700 font-medium">
            +{formatAmount(income, currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Chiqim</span>
          <span className="text-rose-700 font-medium">
            −{formatAmount(expense, currency)}
          </span>
        </div>
        <div className="flex justify-between pt-1 border-t border-slate-100">
          <span className="text-slate-700">Qoldiq</span>
          <span className="font-semibold">{formatAmount(balance, currency)}</span>
        </div>
      </div>
    </div>
  );
}
