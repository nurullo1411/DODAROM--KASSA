import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toIsoDateInput } from "@/lib/format";
import { createTransaction } from "../actions";

export const dynamic = "force-dynamic";

export default async function NewTransactionPage() {
  const [cashBoxes, departments] = await Promise.all([
    prisma.cashBox.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.department.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  if (cashBoxes.length === 0 || departments.length === 0) {
    return (
      <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-xl p-6">
        <p className="text-slate-700">
          Avval kassa va bo'limlarni qo'shing (admin panel).
        </p>
      </div>
    );
  }

  const today = toIsoDateInput(new Date());

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Yangi tranzaksiya</h1>
        <Link
          href="/transactions"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Orqaga
        </Link>
      </div>

      <form
        action={createTransaction}
        className="bg-white border border-slate-200 rounded-xl p-6 space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">
              Tur
            </span>
            <select
              name="type"
              required
              defaultValue="expense"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <option value="income">Kirim</option>
              <option value="expense">Chiqim</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">
              Sana
            </span>
            <input
              name="date"
              type="date"
              required
              defaultValue={today}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">
            Kassa
          </span>
          <select
            name="cashBoxId"
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {cashBoxes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.currency})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">
            Bo'lim
          </span>
          <select
            name="departmentId"
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">
            Summa
          </span>
          <input
            name="amount"
            type="text"
            inputMode="numeric"
            required
            placeholder="Masalan: 500000"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700 mb-1 block">
            Izoh
          </span>
          <textarea
            name="note"
            rows={2}
            placeholder="Ixtiyoriy"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-slate-900 text-white rounded-lg py-2.5 font-medium hover:bg-slate-800 transition"
          >
            Saqlash
          </button>
          <Link
            href="/transactions"
            className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
          >
            Bekor qilish
          </Link>
        </div>
      </form>
    </div>
  );
}
