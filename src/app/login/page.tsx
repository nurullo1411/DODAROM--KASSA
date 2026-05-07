import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { login } from "./actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ setup?: string; error?: string }>;
}) {
  const session = await getSession();
  if (session) redirect("/");
  const userCount = await prisma.user.count();
  if (userCount === 0) redirect("/setup");

  const params = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold mb-1">Dodorom Kassa</h1>
        <p className="text-slate-600 mb-6 text-sm">Tizimga kirish</p>
        {params.setup === "ok" && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
            Sozlash muvaffaqiyatli. Endi tizimga kiring.
          </div>
        )}
        <form action={login} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">
              Email
            </span>
            <input
              name="email"
              type="email"
              required
              autoFocus
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-1 block">
              Parol
            </span>
            <input
              name="password"
              type="password"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </label>
          <button
            type="submit"
            className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-medium hover:bg-slate-800 transition"
          >
            Kirish
          </button>
        </form>
      </div>
    </div>
  );
}
