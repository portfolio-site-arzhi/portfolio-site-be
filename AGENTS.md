# Project Rules

Gunakan file ini sebagai ringkasan cepat. Aturan detail dipisah ke folder `rules`.

## Prioritas Penting

- Wajib pakai Context7 (MCP) saat butuh pembuatan kode yang bergantung pada library/API, langkah setup/konfigurasi, atau dokumentasi library/API. Resolve Library ID dulu lalu ambil docs; untuk Prisma gunakan Context7, bukan Prisma-Local.
- Jangan menjalankan aplikasi/server secara otomatis; cukup jalankan integration test yang relevan.
- Hindari `any`, `console.log`, dan edit `package.json` manual. Gunakan `unknown` dengan narrowing, `console.error` bila perlu, serta `npm install`/`npm install -D` untuk dependency.
- Field database wajib `snake_case`; table Prisma baru wajib memiliki `created_by` dan `updated_by` dengan default `0`.
- Kontrak API penting: validation error berstatus `400`, list berpaging memakai sorting stabil dengan `id desc`, dan update upload mengikuti `status_file`.
- Ikuti pemisahan route, middleware, validation, controller, service, dan repository; interface/type diekspor dari `src\\model\\index.ts`.
- Endpoint baru wajib memiliki dokumentasi modul tersendiri di `docs`; endpoint yang diubah wajib memperbarui dokumentasi modul terkait.

## Index Rules

- `rules/01-general.mdx`
  Context7, standar coding, dependency, database, dan environment.
- `rules/02-architecture.mdx`
  Struktur folder, type/interface, dan repository contract.
- `rules/03-api-contract.mdx`
  Validation, pagination, sorting, dan upload file.
- `rules/04-documentation.mdx`
  Aturan dokumentasi API.
- `rules/05-testing-and-verification.mdx`
  Isolasi dan pemilihan integration test.
- `rules/06-environment.mdx`
  Aturan environment dan logging.

## Catatan

- `AGENTS.md` ini tetap dipakai sebagai ringkasan cepat.
- Detail aturan harus dirujuk dari `rules/*.mdx`.
