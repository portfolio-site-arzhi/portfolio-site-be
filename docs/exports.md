Exports API
===========

Endpoint ini digunakan oleh CMS untuk menghasilkan file PDF terpisah:

- CV standar ATS dalam format PDF
- Kumpulan detail portfolio dalam format PDF

Catatan penting:

- Kedua endpoint mengembalikan file dengan `Content-Type: application/pdf`.
- Backend akan mengirim header `Content-Disposition: attachment`, sehingga file siap diunduh oleh frontend CMS.
- Query param `locale` bersifat optional.
- Nilai `locale` yang didukung: `id` atau `en`.
- Jika `locale` tidak dikirim, default filename yang dipakai adalah `en`.
- Isi data multi-language akan memprioritaskan field bahasa Inggris.
- Jika field bahasa Inggris bernilai `null`, string kosong, atau hanya spasi, backend otomatis fallback ke field bahasa Indonesia.
- CV PDF memakai format text-first yang sederhana agar lebih ramah ATS.
- Portfolio PDF dibuat sebagai file terpisah dari CV dan berisi seluruh data portfolio CMS dalam bentuk detail.
- Konten rich editor akan dirapikan menjadi paragraf dan bullet list yang lebih terbaca di PDF, bukan tag HTML mentah.
- Tanggal `Exported at` tidak ditampilkan di hasil PDF.
- Header CV menampilkan informasi utama di bagian atas, termasuk email, address, LinkedIn, dan GitHub jika tersedia di site configuration.

Export CV ATS PDF
-----------------

- Endpoint: `GET http://localhost:9000/exports/cv`
- Query params:
  - `locale` (optional): `id` atau `en`

Catatan:

- Data CV diambil dari konfigurasi landing (`site-configs`), experience yang published, education yang active, certification yang active, dan skill yang active.
- Foto profile tidak dimasukkan ke CV PDF agar format tetap sederhana dan ATS-friendly.
- Isi data akan memprioritaskan bahasa Inggris, lalu fallback ke Indonesia jika versi Inggris kosong.

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/exports/cv?locale=en" \
  -H "Accept: application/pdf" \
  --output cv-ats-en.pdf
```

Export Portfolio Detail PDF
---------------------------

- Endpoint: `GET http://localhost:9000/exports/portfolios`
- Query params:
  - `locale` (optional): `id` atau `en`

Catatan:

- File ini berbeda dari CV PDF.
- Data yang diekspor adalah seluruh portfolio dari CMS, termasuk informasi status publish, deskripsi, contribution, outcome, stacks, dan link terkait.
- Field WYSIWYG seperti `contribution`, `outcome`, dan deskripsi rich editor lain akan dirapikan menjadi paragraf dan bullet list.
- Isi data akan memprioritaskan bahasa Inggris, lalu fallback ke Indonesia jika versi Inggris kosong.
- Jika file image portfolio tersedia di server dan formatnya bisa dirender oleh PDF engine, gambar upload portfolio akan ikut ditampilkan di bagian bawah detail portfolio pada halaman project tersebut.

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/exports/portfolios?locale=en" \
  -H "Accept: application/pdf" \
  --output portfolio-detail-en.pdf
```
