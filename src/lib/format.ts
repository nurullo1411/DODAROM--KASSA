const AMOUNT_FMT = new Intl.NumberFormat("uz-UZ");

export function formatAmount(amount: bigint | number, currency: string): string {
  const n = typeof amount === "bigint" ? amount : BigInt(Math.trunc(amount));
  const formatted = AMOUNT_FMT.format(n);
  const symbol = currency === "UZS" ? "so'm" : currency === "USD" ? "$" : currency;
  if (currency === "USD") return `${symbol}${formatted}`;
  return `${formatted} ${symbol}`;
}

export function parseAmountInput(raw: string): bigint | null {
  const cleaned = raw.replace(/[\s,]/g, "").trim();
  if (!cleaned) return null;
  if (!/^[0-9]+$/.test(cleaned)) return null;
  try {
    return BigInt(cleaned);
  } catch {
    return null;
  }
}

const DATE_FMT = new Intl.DateTimeFormat("uz-UZ", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return DATE_FMT.format(date);
}

export function toIsoDateInput(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
