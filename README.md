# 🚀 ProSync — Manajemen Projek Kolaboratif

Platform manajemen projek real-time untuk kolaborasi tim IT. Buat projek, undang anggota, dan pantau progres secara instan menggunakan Kanban Board.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%7C%20DB%20%7C%20Realtime-green?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4-38bdf8?logo=tailwindcss)

## ✨ Fitur

- 🔐 **Login dengan Google** — Autentikasi via Google OAuth
- 📋 **Kanban Board** — Drag & drop tugas antar kolom (Todo, In Progress, Done)
- 👥 **Kolaborasi Tim** — Undang anggota via link invite
- 🔄 **Real-time Sync** — Semua perubahan ter-update otomatis tanpa refresh
- 💬 **Komentar Tugas** — Diskusi di setiap tugas secara real-time
- 🔔 **Notifikasi** — Pop-up saat ada tugas baru atau anggota bergabung
- 🔍 **Filter & Search** — Cari tugas berdasarkan judul, filter by anggota/status
- 👤 **Info Anggota** — Lihat siapa yang buat, kerjakan, dan selesaikan tugas
- 🌙 **Dark Mode** — UI modern dengan glassmorphism dan gradient effects

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| **Next.js 16** (App Router) | Framework frontend |
| **TypeScript** | Type safety |
| **Tailwind CSS v4** | Styling |
| **shadcn/ui** | Komponen UI |
| **Supabase** | Auth, Database, Realtime |
| **TanStack Query** | State management |
| **Framer Motion** | Animasi |
| **@hello-pangea/dnd** | Drag & drop |

## 📋 Prasyarat

- **Node.js** >= 18
- **npm** >= 9
- Akun **Supabase** (gratis di [supabase.com](https://supabase.com))
- **Google Cloud Console** untuk OAuth credentials

## 🚀 Cara Menjalankan

### 1. Clone Repository

```bash
git clone https://github.com/msaririzki/Menejemen-Projek.git
cd Menejemen-Projek
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Buat file `.env.local` di root folder:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> Dapatkan URL dan Anon Key dari **Supabase Dashboard** → **Settings** → **API**

### 4. Setup Database Supabase

1. Buka [Supabase SQL Editor](https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new)
2. Copy & paste isi file `supabase/schema.sql` lalu **Run**
3. Copy & paste isi file `supabase/migration_v2.sql` lalu **Run**

### 5. Setup Google OAuth

1. Buka [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Buat **OAuth 2.0 Client ID** (Web Application)
3. Tambahkan **Authorized redirect URI**:
   ```
   https://YOUR_PROJECT.supabase.co/auth/v1/callback
   ```
4. Buka **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
5. Masukkan **Client ID** dan **Client Secret**
6. Aktifkan **Enable Sign in with Google**

### 6. Konfigurasi Supabase URL

Di **Supabase Dashboard** → **Authentication** → **URL Configuration**:
- **Site URL**: `http://localhost:3000` (atau domain production)
- **Redirect URLs**: tambahkan `http://localhost:3000/auth/callback`

### 7. Jalankan Development Server

```bash
npm run dev
```

Buka `http://localhost:3000` di browser.

## 🌐 Deploy ke Production (Server)

### Menggunakan Node.js Server

```bash
# 1. Build production
npm run build

# 2. Jalankan server
npm start
```

Server akan berjalan di port `3000` secara default.

### Menggunakan PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Build dan jalankan
npm run build
pm2 start npm --name "prosync" -- start

# Cek status
pm2 status

# Lihat logs
pm2 logs prosync
```

### Environment Variables untuk Production

Update `.env.local` untuk production:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Jangan lupa update **Site URL** dan **Redirect URLs** di Supabase Dashboard sesuai domain production.

## 📁 Struktur Folder

```
src/
├── app/                    # Halaman (App Router)
│   ├── auth/callback/      # OAuth callback
│   ├── dashboard/          # Dashboard projek
│   ├── invite/[code]/      # Halaman join via link
│   ├── login/              # Halaman login
│   └── project/[id]/       # Workspace projek (Kanban)
├── components/             # Komponen UI
│   ├── kanban/             # Kanban board, task detail, filters
│   ├── ui/                 # shadcn/ui components
│   ├── create-project-dialog.tsx
│   ├── notification-bell.tsx
│   ├── online-avatars.tsx
│   └── project-card.tsx
├── hooks/                  # Custom hooks
│   ├── use-comments.ts     # CRUD komentar
│   ├── use-members.ts      # Anggota projek
│   ├── use-notifications.ts# Notifikasi real-time
│   ├── use-projects.ts     # CRUD projek
│   ├── use-realtime.ts     # Supabase Realtime
│   └── use-tasks.ts        # CRUD tugas
└── lib/                    # Utilities
    ├── supabase/           # Supabase client
    └── types.ts            # TypeScript types
```

## 📄 Lisensi

MIT License — bebas digunakan untuk keperluan apapun.
