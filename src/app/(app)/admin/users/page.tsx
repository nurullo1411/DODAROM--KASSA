import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUser, toggleUser } from "./actions";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  kassir: "Kassir",
  buxgalter: "Buxgalter",
};

export default async function AdminUsersPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Foydalanuvchilar</h1>
        <Link
          href="/admin"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Admin
        </Link>
      </div>

      <form
        action={createUser}
        className="bg-white border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <div>
          <label className="text-xs text-slate-600 block mb-1">
            To'liq ism
          </label>
          <input
            name="fullName"
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600 block mb-1">Email</label>
          <input
            name="email"
            type="email"
            required
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-600 block mb-1">Rol</label>
          <select
            name="role"
            defaultValue="kassir"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="admin">Admin</option>
            <option value="kassir">Kassir</option>
            <option value="buxgalter">Buxgalter</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-600 block mb-1">
            Parol (kamida 6 belgi)
          </label>
          <input
            name="password"
            type="text"
            required
            minLength={6}
            placeholder="Xodimga aytish uchun"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            className="bg-slate-900 text-white rounded-lg px-4 py-2 text-sm"
          >
            Qo'shish
          </button>
          <p className="text-xs text-slate-500 mt-2">
            Parolni xodimga qo'lda bering — keyin u o'zi o'zgartirsa bo'ladi.
          </p>
        </div>
      </form>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left px-3 py-2 font-medium">Ism</th>
              <th className="text-left px-3 py-2 font-medium">Email</th>
              <th className="text-left px-3 py-2 font-medium">Rol</th>
              <th className="text-left px-3 py-2 font-medium">Holat</th>
              <th className="text-right px-3 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-slate-100">
                <td className="px-3 py-2 font-medium">
                  {u.fullName}
                  {u.id === session.userId && (
                    <span className="ml-2 text-xs text-slate-500">(siz)</span>
                  )}
                </td>
                <td className="px-3 py-2 text-slate-600">{u.email}</td>
                <td className="px-3 py-2">{ROLE_LABEL[u.role] ?? u.role}</td>
                <td className="px-3 py-2">
                  {u.isActive ? (
                    <span className="text-emerald-700 text-xs font-medium">
                      Faol
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs">Bloklangan</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {u.id !== session.userId && (
                    <form action={toggleUser} className="inline">
                      <input type="hidden" name="id" value={u.id} />
                      <button
                        type="submit"
                        className="text-xs text-slate-600 hover:text-slate-900 underline-offset-2 hover:underline"
                      >
                        {u.isActive ? "Bloklash" : "Tiklash"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
