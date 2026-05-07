import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createCashBox, toggleCashBox } from "./actions";

export const dynamic = "force-dynamic";

const KIND_LABEL: Record<string, string> = {
  cash: "Naqd",
  card: "Karta",
  bank: "Bank",
};

export default async function AdminCashBoxesPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const boxes = await prisma.cashBox.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { transactions: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Kassalar</h1>
        <Link
          href="/admin"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Admin
        </Link>
      </div>

      <form
        action={createCashBox}
        className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-3"
      >
        <div className="sm:col-span-2">
          <label className="text-xs text-slate-600 block mb-1">Nom</label>
          <input
            name="name"
            required
            placeholder="Masalan: Naqd-2"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600 block mb-1">Valyuta</label>
          <select
            name="currency"
            defaultValue="UZS"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="UZS">UZS</option>
            <option value="USD">USD</option>
            <option value="RUB">RUB</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600 block mb-1">Tur</label>
          <select
            name="kind"
            defaultValue="cash"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="cash">Naqd</option>
            <option value="card">Karta</option>
            <option value="bank">Bank</option>
          </select>
        </div>
        <div className="sm:col-span-4">
          <button
            type="submit"
            className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm"
          >
            Qo'shish
          </button>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Nom</th>
              <th className="text-left px-3 py-2 font-medium">Valyuta</th>
              <th className="text-left px-3 py-2 font-medium">Tur</th>
              <th className="text-right px-3 py-2 font-medium">Tranzaksiyalar</th>
              <th className="text-left px-3 py-2 font-medium">Holat</th>
              <th className="text-right px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {boxes.map((b) => (
              <tr key={b.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">{b.name}</td>
                <td className="px-3 py-2">{b.currency}</td>
                <td className="px-3 py-2 text-slate-600">
                  {KIND_LABEL[b.kind] ?? b.kind}
                </td>
                <td className="px-3 py-2 text-right text-slate-500">
                  {b._count.transactions}
                </td>
                <td className="px-3 py-2">
                  {b.isActive ? (
                    <span className="text-emerald-700 text-xs font-medium">
                      Faol
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">O'chirilgan</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <form action={toggleCashBox} className="inline">
                    <input type="hidden" name="id" value={b.id} />
                    <button
                      type="submit"
                      className="text-xs text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline"
                    >
                      {b.isActive ? "O'chirish" : "Yoqish"}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
