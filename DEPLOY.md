# Vercel'ga deploy — soddalashtirilgan yo'l

Bu yo'lda **GitHub + Vercel** kerak (Neon alohida emas — Vercel ichidagi Postgres ishlatamiz).

## 0. Loyiha holati

- ✅ Code git'da commit qilingan
- ✅ Build script avtomatik DB sxemasini push qiladi
- ✅ `POSTGRES_URL` va `DATABASE_URL` ikkalasi ham qo'llab-quvvatlanadi

Sizning **AUTH_SECRET** (production uchun):
```
uTSMLqu8QBegl99V3Xmu3PGiZR0FwZ18IeE8l8IR8dlIRm3-38A2LPEmmrkyWcD6
```

## 1. GitHub akkaunt yaratish (3 daqiqa)

1. https://github.com/signup ga kiring
2. Email, parol, username (masalan: `dodorom-kassa`) kiriting
3. Email'ga kelgan kodni tasdiqlang
4. Tarif: **Free** ni tanlang (Continue for free)

## 2. GitHub'da repository yaratish

1. https://github.com/new ga kiring
2. **Repository name:** `dodorom-kassa`
3. **Privacy:** **Private** (xodimlar ma'lumotlari bo'ladi)
4. **Initialize this repository:** hech narsa belgilamang
5. **Create repository** ni bosing
6. Keyingi sahifada chiqadigan komandalarni nusxa oling — shunaqa ko'rinadi:
   ```
   git remote add origin https://github.com/SIZ/dodorom-kassa.git
   git branch -M main
   git push -u origin main
   ```

## 3. Lokal koddi GitHub'ga push qilish

PowerShell'da loyiha papkasidan (yuqoridagilarni o'zingizning username bilan ishlating):

```powershell
cd C:\Users\DODAROM\projects\dodorom-kassa
git remote add origin https://github.com/SIZNING-USERNAME/dodorom-kassa.git
git branch -M main
git push -u origin main
```

Birinchi push'da brauzer ochilib GitHub'ga kirishni so'raydi — tasdiqlang.

## 4. Vercel akkaunt yaratish (1 daqiqa)

1. https://vercel.com/signup ga kiring
2. **"Continue with GitHub"** ni tanlang — alohida ro'yxatdan o'tish shart emas
3. GitHub avtorizatsiyasini tasdiqlang
4. Sizdan ism so'raydi → kiriting → Continue
5. Plan: **Hobby** (bepul) ni tanlang

## 5. Loyihani Vercel'ga import qilish

1. Vercel dashboard'da **Add New → Project** ni bosing
2. **Import Git Repository** ro'yxatida `dodorom-kassa` topilmasa, **Configure GitHub App** orqali Vercel'ga repo ko'rinishiga ruxsat bering
3. `dodorom-kassa` yonidagi **Import** ni bosing

**Configure Project** sahifasida:
- Framework Preset: **Next.js** (avtomatik)
- Root Directory: `./` (default)
- Build / Output / Install: hech narsa o'zgartirmang
- **Environment Variables** ni kengaytiring va qo'shing:

| Nom | Qiymat |
|---|---|
| `AUTH_SECRET` | `uTSMLqu8QBegl99V3Xmu3PGiZR0FwZ18IeE8l8IR8dlIRm3-38A2LPEmmrkyWcD6` |

> ⚠️ DATABASE_URL ni hozir **qo'shmang** — Postgres'ni keyingi qadamda ulaymiz.

5. **Deploy** tugmasini bosing

> ⚠️ Birinchi deploy **xato beradi** (DATABASE_URL hali yo'q) — bu normal. Postgres ulagandan keyin qayta deploy qilamiz.

## 6. Vercel Postgres (Neon) qo'shish

1. Loyiha sahifasida yuqorida **Storage** tab'iga o'ting
2. **Create Database** → **Neon (Postgres)** ni tanlang
3. Sozlash:
   - **Database name:** `dodorom-kassa-db` (yoki default qoldiring)
   - **Region:** **Frankfurt (eu-central-1)** — Toshkentga eng yaqini
   - **Plan:** Free
4. **Create** ni bosing
5. Keyingi sahifada **"Connect Project"** → tanlangan bo'lishi kerak → **Connect**
6. Vercel avtomatik bir nechta env'larni qo'shadi: `DATABASE_URL`, `POSTGRES_URL`, va h.k.

## 7. Qayta deploy qilish

1. Project → **Deployments** tab
2. Eng oxirgi (xato bergan) deploy yonidagi **... → Redeploy**
3. **Use existing build cache:** belgilamang
4. **Redeploy**
5. 1-2 daqiqa kutib turing → ✓ Ready

Bu deploy paytida `prisma db push` avtomatik ishlaydi va DB sxemasini yaratadi.

## 8. Birinchi sinov

1. Project sahifasida ko'k URL'ni bosing (masalan: `https://dodorom-kassa.vercel.app`)
2. **`/setup`** sahifasi avtomatik ochiladi (chunki hali admin yo'q)
3. Admin yarating: ism, email, parol
4. Login qiling → Dashboard ko'rinadi
5. Yangi tranzaksiya qo'shing
6. Hisobotlar va Excel eksportni sinang

## 9. Telefonga PWA o'rnatish

Vercel URL'ni telefon Chrome'da oching:
- Menu (uch nuqta) → **"Add to Home Screen"** yoki **"Install app"**
- Ikonka paydo bo'ladi — tabiiy ilova kabi ishlaydi

## 10. Xodim qo'shish

1. Admin paneliga kiring → Foydalanuvchilar
2. Yangi qo'shing: ism, email, rol (kassir/buxgalter), parol
3. Xodimga URL + email + parolni Telegram'da yuboring

## Custom domen ulash (ixtiyoriy)

Agar `kassa.dodorom.uz` kabi shaxsiy domen kerak bo'lsa:
1. Vercel project → Settings → Domains → Add
2. Domeningizni yozing
3. Vercel beradigan DNS yozuvlarini domain registrar'ga qo'shing
4. 5-30 daqiqa ichida ulanadi

## Yangilanish

Keyinchalik kod o'zgartirsangiz, lokal'da:
```powershell
git add .
git commit -m "O'zgartirish izohi"
git push
```
Vercel avtomatik yangi deploy qiladi (build paytida sxema ham yangilanadi).

## Muammolar

- **Build xato — `Environment variable not found: DATABASE_URL`:** Vercel Postgres'ni Connect Project orqali ulaganligingizni va keyin Redeploy qilganligingizni tekshiring.
- **`/setup` 500 xato:** DB sxemasi yaratilmagan. Vercel Logs'da `prisma db push` xato bergan bo'lishi mumkin — Logs'ni o'qing.
- **Login ishlamaydi:** AUTH_SECRET env'da to'g'ri yozilganmi tekshiring.

Yordam kerak bo'lsa — xato xabarini yoki screenshot'ni yuboring.
