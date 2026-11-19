# Panduan Setup Marriage Knowledge Challenge

## Prasyarat

- Node.js 18+ dan npm
- Akun Supabase (gratis di supabase.com)
- Git

## 1. Clone & Install

```bash
cd pai
npm install
```

## 2. Setup Supabase

### Buat Project Supabase
1. Buka [supabase.com](https://supabase.com) dan buat project baru
2. Catat **Project URL** dan **Anon Key** dari Settings > API

### Jalankan Migrasi Database
1. Di Supabase Dashboard, buka **SQL Editor**
2. Copy-paste isi file `supabase/migrations/001_create_quiz_tables.sql`
3. Klik **Run** untuk membuat tabel dan policies

### Setup Edge Function (Optional - untuk server-side scoring)
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref YOUR_PROJECT_REF`
4. Deploy function: `supabase functions deploy score-quiz`
5. Set environment variables di Supabase Dashboard > Edge Functions:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Buat Admin User
1. Di Supabase Dashboard > Authentication > Users
2. Klik **Add User** > **Invite User**
3. Masukkan email admin dan password
4. User akan menerima email untuk set password

## 3. Konfigurasi Environment Variables

Copy file example:
```bash
cp .env.example .env
```

Edit `.env` dengan kredensial Supabase Anda:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Jalankan Development Server

```bash
npm run dev
```

Buka http://localhost:5173

## 5. Testing Checklist

- [ ] Halaman beranda tampil dengan benar
- [ ] Input nama panggilan berfungsi
- [ ] Timer berjalan dan auto-submit saat habis
- [ ] Navigasi soal (prev/next/dots) berfungsi
- [ ] Jawaban tersimpan saat pindah soal
- [ ] Refresh halaman tidak menghapus jawaban
- [ ] Submit kuis menampilkan hasil dengan benar
- [ ] Pembahasan soal tampil setelah submit
- [ ] Data masuk ke Supabase (cek Table Editor)
- [ ] Admin login berfungsi
- [ ] Dashboard menampilkan statistik
- [ ] Filter dan pencarian berfungsi
- [ ] Export CSV bisa dibuka di Excel
- [ ] Offline mode: putus internet → submit → reconnect → retry

## 6. Build untuk Production

```bash
npm run build
```

Output di folder `dist/`.

## Struktur Database

### quiz_attempts
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | UUID | Primary Key |
| participant_name | TEXT | Nama peserta |
| started_at | TIMESTAMPTZ | Waktu mulai |
| submitted_at | TIMESTAMPTZ | Waktu kumpul |
| duration_seconds | INTEGER | Durasi pengerjaan |
| total_score | INTEGER | Total nilai |
| correct_answers | INTEGER | Jumlah benar |
| incorrect_answers | INTEGER | Jumlah salah |
| unanswered_questions | INTEGER | Jumlah kosong |
| status | TEXT | in_progress/completed/submitted |
| created_at | TIMESTAMPTZ | Timestamp dibuat |

### quiz_answers
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | UUID | Primary Key |
| attempt_id | UUID | FK ke quiz_attempts |
| question_number | INTEGER | Nomor soal |
| answer | JSONB | Jawaban peserta |
| is_correct | BOOLEAN | Benar/salah |
| score | NUMERIC | Poin diperoleh |
| created_at | TIMESTAMPTZ | Timestamp dibuat |

## Row Level Security Policies

- **Anon**: INSERT/UPDATE quiz_attempts (hanya milik sendiri)
- **Anon**: INSERT quiz_answers (hanya milik sendiri)
- **Authenticated (Admin)**: SELECT ALL quiz_attempts & quiz_answers
- **Authenticated (Admin)**: UPDATE quiz_attempts (admin operations)

## Troubleshooting

### Supabase Connection Error
- Pastikan VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY benar
- Cek CORS settings di Supabase > Authentication > URL Configuration

### Edge Function Error
- Pastikan Service Role Key diset di Edge Function environment variables
- Cek logs di Supabase > Edge Functions > Logs

### Build Error
- Hapus node_modules dan package-lock.json, lalu `npm install`
- Pastikan Node.js version >= 18

### Data Tidak Masuk ke Database
- Buka DevTools > Network, cek request ke Supabase
- Cek Console untuk error
- Pastikan RLS policies sudah benar
