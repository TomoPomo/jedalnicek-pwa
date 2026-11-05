# 🚀 Návod na nasadenie: GitHub, Supabase a Netlify

Tento sprievodca vás krok za krokom prevedie nasadením aplikácie **Jedálniček** do produkcie.

---

## 1. 🐙 Nahratie do GitHubu

V termináli v priečinku projektu spustite nasledujúce príkazy:

```bash
# 1. Inicializácia git repozitára (ak ešte nie je)
git init

# 2. Pridanie všetkých súborov
git add .

# 3. Vytvorenie prvého commitu
git commit -m "feat: Inicializacia aplikacie Jedalnicek PWA s real-time synchronizaciou"

# 4. Premenovanie vetvy na main
git branch -M main

# 5. Prepojenie s vaším prázdnym repozitárom na GitHube (nahraďte vašou URL)
git remote add origin https://github.com/VASE_MENO/jedalnicek-pwa.git

# 6. Odoslanie kódu na GitHub
git push -u origin main
```

---

## 2. ⚡ Nastavenie Supabase (Databáza & Real-time)

1. Prejdite na [https://supabase.com](https://supabase.com) a kliknite na **New Project**.
2. Zvoľte názov (napr. `jedalnicek-db`) a vytvorte databázu.
3. V ľavom menu otvorte **SQL Editor** -> kliknite na **New Query**.
4. Skopírujte celý obsah súboru `supabase/schema.sql` a vložte ho do editora.
5. Kliknite na zelené tlačidlo **Run**. Vytvoria sa tabuľky `weeks` a `dishes`, aktivuje sa Row Level Security (RLS) a zapne sa Realtime synchronizácia.
6. V ľavom menu prejdite do **Project Settings** -> **API**:
   - Skopírujte **Project URL** (napr. `https://xyz.supabase.co`)
   - Skopírujte **anon / public key** (dlhý reťazec `eyJhbGci...`)

---

## 3. 🌐 Nasadenie na Netlify

### Spôsob A: Cez Netlify Web (najjednoduchšie s automatickým CI/CD)
1. Prihláste sa na [https://app.netlify.com](https://app.netlify.com).
2. Kliknite na **Add new site** -> **Import an existing project**.
3. Vyberte **GitHub** a zvoľte váš repozitár `jedalnicek-pwa`.
4. Netlify automaticky deteguje nastavenia vďaka pribalenému `netlify.toml`:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. V sekcii **Environment variables** (premenné prostredia) pridajte:
   - `VITE_SUPABASE_URL` = Vaša Project URL zo Supabase
   - `VITE_SUPABASE_ANON_KEY` = Váš anon key zo Supabase
6. Kliknite na **Deploy site**.
7. Po dokončení získate live URL adresu (napr. `https://jedalnicek-pwa.netlify.app`), ktorú si vy aj partner môžete otvoriť a pridať na plochu telefónu ako aplikáciu (PWA).

*(Poznámka: Ak premenné prostredia na Netlify nenastavíte vopred, nevadí — po otvorení stránky môžete kľúče kedykoľvek zadať priamo v aplikácii cez ikonu ⚙️ Nastavenia v pravom hornom rohu).*

---

## 4. 📱 Inštalácia na telefón (PWA)
- **iPhone (Safari)**: Otvorte stránku na Netlify -> Ťuknite na ikonu **Zdieľať** (štvorec so šípkou hore) -> **Pridať na plochu**.
- **Android (Chrome)**: Otvorte stránku -> Ťuknite na menu (tri bodky) -> **Pridať na plochu** / **Nainštalovať aplikáciu**.
