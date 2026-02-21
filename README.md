# Portfolio Site Backend

Backend API untuk CMS dan landing page portfolio pribadi. Project ini dibangun dengan TypeScript, Express 5, Prisma, dan PostgreSQL.

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Tech Stack](#tech-stack)
- [Prasyarat](#prasyarat)
- [Quick Start (Local)](#quick-start-local)
- [Keamanan Environment](#keamanan-environment)
- [Menjalankan Dengan Docker](#menjalankan-dengan-docker)
- [Testing](#testing)
- [Format Error](#format-error)
- [Struktur Proyek](#struktur-proyek)
- [Troubleshooting](#troubleshooting)
- [License](#license)

## Fitur Utama

- Google OAuth login dengan session cookie (`access_token`, `refresh_token`).
- CRUD user untuk kebutuhan CMS.
- Manajemen site configuration (`system`, `home`, `about`, `footer`) termasuk upload foto profile.
- CRUD + sorting untuk `experiences`, `educations`, dan `certifications`.
- Endpoint landing/public terpisah dari endpoint CMS.
- Validasi input berbasis Zod dengan format error yang konsisten.
- Rate limiting global untuk proteksi API.
- Health check endpoint (`GET /health`) yang juga mengecek koneksi database.

## Tech Stack

- Runtime: Node.js + TypeScript
- HTTP Server: Express 5
- ORM: Prisma
- Database: PostgreSQL
- Validation: Zod
- Testing: Jest + Supertest
- Containerization: Docker + Docker Compose + Nginx

## Prasyarat

- Node.js 24.x (direkomendasikan, mengikuti image Docker) atau versi LTS yang kompatibel
- npm 10+
- PostgreSQL (untuk mode local non-Docker)
- Docker & Docker Compose (opsional, jika menjalankan via container)

## Quick Start (Local)

1. Install dependency:

```bash
npm ci
```

2. Siapkan file environment:

```powershell
Copy-Item env.example .env
```

3. Isi `.env` mengikuti template `env.example` sesuai environment server Anda.

4. Generate Prisma client dan jalankan migration:

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Seed data awal (admin):

```bash
npm run seed
```

6. Jalankan server development:

```bash
npm run dev
```

7. Verifikasi service:

```bash
curl http://localhost:9000/health
```

## Keamanan Environment

- Jangan commit file `.env` atau `.env.testing` yang berisi nilai asli.
- Gunakan `env.example` hanya sebagai template struktur.
- Simpan credential production di secret manager/server config, bukan di dokumentasi repo.

## Menjalankan Dengan Docker

1. Siapkan `.env` dari `env.example` dan isi nilainya sesuai konfigurasi server/container Anda.
2. Buat network eksternal sekali saja (jika belum ada):

```bash
docker network create global_portfolio_site_network
```

3. Jalankan service:

```bash
docker compose up -d --build
```

4. Jalankan migration + seed di container backend:

```bash
docker compose exec portfolio_site_be npm run prisma:migrate
docker compose exec portfolio_site_be npm run seed
```

5. Akses API melalui:

- `http://localhost:9000`
- Health check: `http://localhost:9000/health`

## Testing

1. Siapkan file `.env.testing` (copy dari `env.testing`):

```powershell
Copy-Item env.testing .env.testing
```

2. Pastikan `DATABASE_URL` di `.env.testing` mengarah ke database test.
3. Jalankan test:

```bash
npm run test:local
```

Catatan:

- Test menggunakan Jest + Supertest.  
- Database dibersihkan per test case untuk menjaga isolasi.

## Format Error

Semua error menggunakan format konsisten:

```json
{
  "errors": [
    "Pesan error"
  ]
}
```

## Struktur Proyek

```text
.
|- docs/                  # Dokumentasi endpoint API (contoh cURL)
|- prisma/
|  |- migrations/         # Riwayat migration database
|  |- schema.prisma       # Skema Prisma
|  |- seed.ts             # Seed admin user
|- src/
|  |- config/             # Konfigurasi app (express, jwt, logger, prisma, upload)
|  |- controllers/        # Layer HTTP controller
|  |- helper/             # Utility/helper
|  |- model/              # Interface/type model domain
|  |- repository/         # Akses data + contract repository
|  |- routes/             # Registrasi endpoint per modul
|  |- services/           # Business logic
|  |- types/              # Shared type tambahan
|  |- validation/         # Validasi request/domain
|  |- index.ts            # Entry point aplikasi
|- tests/
|  |- integration/        # Integration tests
|  |- utils/              # Helper testing
|- docker-compose.yml
|- docker-compose.override.yml
|- env.example
|- env.testing
```

## Troubleshooting

- Error `DATABASE_URL is not configured`: pastikan `.env` ada dan `DATABASE_URL` valid.
- Error terkait schema (mis. migration belum jalan): jalankan `npm run prisma:migrate`.
- Error Prisma client mismatch: jalankan `npm run prisma:generate`.
- Google OAuth gagal: cek kembali konfigurasi OAuth pada environment server.

## License

ISC
