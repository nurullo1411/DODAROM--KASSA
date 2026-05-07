import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/");
  }

  const [cashBoxCount, deptCount, userCount, txCount] = await Promise.all([
    prisma.cashBox.count(),
    prisma.department.count(),
    prisma.user.count(),
    prisma.transaction.count(),
  ]);

  const cards: { href: string; title: string; desc: string; count: number }[] =
    [
      {
        href: "/admin/cashboxes",
        title: "Kassalar",
        desc: "Naqd, Karta, Bank, Dollar va h.k.",
        count: cashBoxCount,
      },
      {
        href: "/admin/departments",
        title: "Bo'limlar",
        desc: "Klentlar, Akfa, Oyna, Ofes va h.k.",
        count: deptCount,
      },
      {
        href: "/admin/users",
        title: "Foydalanuvchilar",
        desc: "Xodimlar va ularning rollari",
        count: userCount,
      },
    ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin paneli</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-400 transition"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">{c.title}</h2>
              <span className="text-2xl font-bold text-slate-400">
                {c.count}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>
      <div className="text-sm text-slate-500">
        Jami yozuvlar: <span className="font-medium">{txCount}</span>
      </div>
    </div>
  );
}
