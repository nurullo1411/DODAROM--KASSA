import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setupSystem } from "./actions";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold mb-2">Tizimni sozlash</h1>
        <p className="text-slate-600 mb-6 text-sm">
          Birinchi marta o'rnatish: admin foydalanuvchi yarating. Boshlang'ich
          bo'limlar va kassalar avtomatik qo'shiladi.
        </p>
        <form action={setupSystem} className="space-y-4">
          <Field label="To'liq ism" name="fullName" required />
          <Field label="Email" name="email" type="email" required />
          <Field
            label="Parol (kamida 6 belgi)"
            name="password"
            type="password"
            required
            minLength={6}
          />
          <button
            type="submit"
            className="w-full bg-slate-900 text-white rounded-lg py-2.5 font-medium hover:bg-slate-800 transition"
          >
            Tizimni sozlash
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 mb-1 block">
        {label}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        minLength={minLength}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
    </label>
  );
}
