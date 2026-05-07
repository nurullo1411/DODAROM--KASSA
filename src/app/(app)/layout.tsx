import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { logout } from "./logout-action";

export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    const userCount = await prisma.user.count();
    redirect(userCount === 0 ? "/setup" : "/login");
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { fullName: true, email: true, role: true },
  });
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold text-slate-900">
              Dodorom Kassa
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="text-slate-700 hover:text-slate-900">
                Dashboard
              </Link>
              <Link
                href="/transactions"
                className="text-slate-700 hover:text-slate-900"
              >
                Tranzaksiyalar
              </Link>
              <Link
                href="/transactions/new"
                className="text-slate-700 hover:text-slate-900"
              >
                + Yangi
              </Link>
              <Link
                href="/reports"
                className="text-slate-700 hover:text-slate-900"
              >
                Hisobotlar
              </Link>
              {session.role === "admin" && (
                <Link
                  href="/admin"
                  className="text-slate-700 hover:text-slate-900"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600 hidden sm:inline">
              {user.fullName}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="text-slate-600 hover:text-slate-900"
              >
                Chiqish
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto p-4">{children}</main>
    </div>
  );
}
