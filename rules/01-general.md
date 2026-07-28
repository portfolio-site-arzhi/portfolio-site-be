# Context7

- Wajib pakai Context7 saat butuh pembuatan kode, langkah setup/konfigurasi, atau dokumentasi library/API.
  - Wajib: resolve Library ID dulu, lalu ambil docs dari Context7.
- Khusus dokumentasi Prisma (syntax, API, best practice), wajib pakai Context7, bukan Prisma-Local.

# Prisma-Local

- Wajib pakai Context7 saat butuh hal terkait Prisma (migration, schema, seeding, query, Prisma Studio, status migration).

# Aturan Umum

- Jangan membuat, menghapus, atau mengubah file aturan (`AGENTS.md`, `rules.md`, dan seluruh file dalam folder `rules/`) kecuali user meminta secara eksplisit.
- Jangan running aplikasi (server) karena sudah dijalankan; cukup jalankan integration test yang relevan, kalau ada error langsung diperbaiki.
- Pattern lebih baik banyak file yang spesifik dan mudah di-maintain/debug.
- Hindari tipe any; kalau perlu gunakan unknown lalu narrowing.
- Hindari penggunaan console.log karena cepat penuh log docker; kecuali console.error.
- Kalau install package, jangan edit package.json manual; selalu gunakan command `npm install <package>` atau `npm install -D <package>` agar versi terbaru yang kompatibel terpasang otomatis.
- kalau ada script yang sering duplicate utamakan buat helper
- Field di DB gunakan snake_case (contoh created_at), bukan camelCase.
- Kalau menambahkan table baru di schema Prisma, wajib tambahkan field created_by dan updated_by (default 0 untuk id by system).
- Isi file .env harus sama seperti env.example (jangan menambahkan nilai sensitif ke repo).
- Isi file .env.testing/env.testing hanya untuk konfigurasi testing lokal dan tidak boleh berisi credential sensitif/production; gunakan nilai dummy atau khusus testing.
- Sering jalankan `npm run typecheck` terutama setelah perubahan kode untuk memastikan tidak ada error TypeScript.
