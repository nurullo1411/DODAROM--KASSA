# Vercel'ga deploy qilish — qadam-baqadam

Bu loyihani **Vercel** + **Neon Postgres** bilan internetga chiqarish uchun yo'l-yo'riq. Hammasi bepul tarif'da boshlanadi.

## 0. Hisoblar

Quyidagilar kerak (har biri 2-3 daqiqa, hammasini GitHub akkaunti bilan kirish bo'ladi):

- [ ] [GitHub](https://github.com) akkaunt
- [ ] [Neon](https://neon.tech) akkaunt — Postgres uchun
- [ ] [Vercel](https://vercel.com) akkaunt — hosting

## 1. Neon'da DB yaratish

1. https://console.neon.tech ga kiring → **New Project**
2. Sozlash:
   - Project name: `dodorom-kassa`
   - Postgres version: 16 (default)
   - Region: **Frankfurt (eu-central-1)** — Toshkentga eng yaqini
3. Yaratilgach, **Connection Details** sahifasi ochiladi
4. **"Pooled connection"** ni tanlang (psql emas, Prisma uchun)
5. Connection string ni nusxa oling. Bunaqa ko'rinadi:
   ```
   postgresql://neondb_owner:xxxxx@ep-xxxxx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require
   ```

## 2. Lokal .env'ni yangilash va sxemani yuklash

1. Loyiha papkasidagi `.env` faylini oching
2. `DATABASE_URL=""` ga o'sha Connection string ni qo'ying:
   ```
   DATABASE_URL="postgresql://neondb_owner:xxxxx@..."
   ```
3. PowerShell'da loyiha papkasiga o'ting va sxemani Neon'ga yuboring:
   ```powershell
   npm run db:push
   ```
4. Lokal dev server'ni ishga tushiring:
   ```powershell
   npm run dev
   ```
5. Brauzerda http://localhost:3000 — `/setup` sahifasida admin yarating
6. Hammasi ishlaganini tekshiring (login, tranzaksiya qo'shish, hisobot)

## 3. GitHub'ga push qilish

PowerShell'da loyiha papkasida:

```powershell
git init
git add .
git commit -m "Initial commit"
```

Endi GitHub'da yangi repository yarating:
- https://github.com/new
- Repository name: `dodorom-kassa`
- **Private** ni tanlang (xodimlar ma'lumotlari bo'ladi)
- "Add README/license" — **belgilamang** (bizda allaqachon bor)
- Create

GitHub bergan ko'rsatmalarni nusxa oling, ular taxminan bunday:

```powershell
git remote add origin https://github.com/SIZNING-USERNAME/dodorom-kassa.git
git branch -M main
git push -u origin main
```

## 4. Vercel'ga ulash

1. https://vercel.com/new ga kiring
2. **Import Git Repository** — GitHub'ni ulang (birinchi marta bo'lsa, ruxsat bering)
3. `dodorom-kassa` repo'sini tanlang → **Import**
4. **Configure Project** sahifasi:
   - Framework Preset: **Next.js** (avtomatik aniqlanadi)
   - Root Directory: `./` (default)
   - **Environment Variables** ni kengaytiring va quyidagilarni qo'shing:

| Nom | Qiymat |
|---|---|
| `DATABASE_URL` | Neon Connection string (yuqoridagidek) |
| `AUTH_SECRET` | `.auth-secret-prod.txt` faylidagi qator |

5. **Deploy** ni bosing
6. 1-2 daqiqa kuting → "Congratulations! Your project has been deployed."
7. Berilgan URL ni oching (masalan: `https://dodorom-kassa.vercel.app`)

## 5. Birinchi sinov

- URL'ni telefon brauzerida ham ochib ko'ring
- Chrome'da: menyu → "Add to Home Screen" — ilovani telefon ekraniga o'rnatadi (PWA)
- Login qiling
- Yangi tranzaksiya qo'shing
- Excel'ga yuklab oling

## 6. Xodim qo'shish

1. Admin paneliga kiring → Foydalanuvchilar
2. Yangi qo'shing: ism, email, rol (kassir/buxgalter), parol
3. Xodimga URL + email + parolni Telegram'da yuboring

## Custom domen ulash (ixtiyoriy)

Agar `kassa.dodorom.uz` kabi shaxsiy domen kerak bo'lsa:
1. Vercel project → Settings → Domains
2. Domeningizni qo'shing
3. Vercel beradigan DNS yozuvlarini domain registrar'ga qo'shing
4. 5-30 daqiqa ichida ulanadi

## Yangilanish (kelajakda)

Keyinchalik kod o'zgartirsangiz:

```powershell
git add .
git commit -m "Description of changes"
git push
```

Vercel avtomatik yangi deploy qiladi.

## Muammo bo'lsa

- **Neon ulanmaydi:** Connection string'da `?sslmode=require` borligini tekshiring
- **Vercel build xato:** Vercel logs'da `prisma generate` ishlamaganmi tekshiring
- **Sxema mos kelmaydi:** lokal'da `npm run db:push` ni qayta ishlating
