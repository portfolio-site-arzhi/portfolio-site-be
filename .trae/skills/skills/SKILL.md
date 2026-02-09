---
name: "Skills"
description: "Aturan kerja repo. Invoke saat mau ubah/tambah file, pakai Prisma/Context7, ubah endpoint, update docs, atau jalankan test."
---

# Workspace Rules (Backend)

Gunakan skill ini sebagai checklist aturan repo sebelum membuat perubahan, terutama untuk Prisma, struktur folder, validasi, docs, dan testing.

## Kapan invoke

Invoke skill ini ketika:
- Mau mengubah/menambah file apa pun
- Ada pekerjaan Prisma (schema, migration, query, seeding, Prisma Studio)
- Butuh setup/konfigurasi atau dokumentasi library/API
- Menambah/mengubah endpoint API dan perlu update docs atau test
- Akan install package baru atau menjalankan perintah test/typecheck

## Context7 & Prisma

- Wajib pakai Context7 untuk:
  - Pembuatan kode berbasis library/API (contoh: integrasi library, konfigurasi)
  - Langkah setup/konfigurasi
  - Dokumentasi library/API
- Wajib resolve Library ID dulu, lalu query docs dari Context7.
- Khusus Prisma (syntax/API/best practice/migration/schema/seeding/query/Studio/status migration): wajib pakai Context7.

## Aturan umum engineering

- Jangan menjalankan server aplikasi (anggap sudah berjalan). Fokus jalankan integration test yang relevan.
- Prefer banyak file yang spesifik dan mudah di-maintain/debug.
- Hindari `any`. Jika perlu gunakan `unknown` lalu lakukan narrowing.
- Hindari `console.log` (log cepat penuh, terutama docker). Boleh `console.error` jika perlu.
- Jika install package: jangan edit `package.json` manual. Gunakan:
  - `npm install <package>`
  - `npm install -D <package>`

## Database conventions

- Field DB wajib `snake_case` (contoh: `created_at`), bukan camelCase.
- Kalau tambah table baru di Prisma schema: wajib ada `created_by` dan `updated_by` (default 0 untuk system).

## Environment

- `.env` harus sama seperti `env.example` (jangan commit nilai sensitif).
- `.env.testing` hanya untuk testing lokal dan tidak boleh berisi credential sensitif/production.
- Anggap semua environment selain development sebagai production-like.
- Untuk logic dev vs non-dev gunakan `NODE_ENV !== "development"`.

## Arsitektur & struktur folder

- Pattern: route, middleware, validation, controller, service, repository.
- Interface/type taruh di `src\\model` dan export lewat `src\\model\\index.ts`.
- Repository baru wajib punya contract interface di `src\\repository\\contracts` dan repository implements contract tersebut.
- Folder:
  - `src\\config`, `src\\controllers`, `src\\helper`, `src\\model`, `src\\repository`, `src\\routes`, `src\\services`, `src\\types`, `src\\validation`
  - `docs`: dokumentasi API (contoh curl) tanpa header Cookie

## Validation & error response

- Semua validation error harus status 400.
- Format error validation:
  ```json
  {
    "errors": [
      "The email is required!",
      "The name is required!",
      "The role is required!"
    ]
  }
  ```
- Usahakan validasi hanya di `src\\validation` (bukan di controller/service).

## Pagination & sorting

- Endpoint list yang paging wajib sorting stabil dengan `id desc` untuk mencegah data pindah halaman/duplikasi.
- Jika sudah ada sort utama lain, `id desc` tetap jadi tie-breaker.

## Upload file

- Untuk update yang ada upload file: request body wajib punya `status_file`.
  - `status_file = 0`: tidak ada perubahan file
  - `status_file = 1` + ada file: ganti file
  - `status_file = 1` + tidak ada file: hapus file

## Dokumentasi API

- Jangan membuat file `.md` sembarangan (repo public).
- Buat/ubah docs hanya di folder `docs`.
- Jika tambah endpoint baru: wajib buat file docs baru khusus modul tersebut.
- Jika ubah endpoint yang sudah ada: update file docs modul terkait (curl tanpa Cookie; header minimal Accept + Content-Type bila perlu).

## Testing

- Setiap test case (`it`) wajib refresh database agar terisolasi.
- Jika perubahan bisa diuji dengan integration test dan belum ada, buat flow test-nya.
- Jangan buat test manual; jalankan integration test yang ada.
- Jalankan test seperlunya agar tidak lama.
- Basic command: `npm run test:local`
- Sering jalankan `npm run typecheck` setelah perubahan TypeScript.
