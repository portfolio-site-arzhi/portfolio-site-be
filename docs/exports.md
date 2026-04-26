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
- Jika `locale` tidak dikirim, default yang dipakai adalah `id`.
- CV PDF memakai format text-first yang sederhana agar lebih ramah ATS.
- Portfolio PDF dibuat sebagai file terpisah dari CV dan berisi seluruh data portfolio CMS dalam bentuk detail.

Export CV ATS PDF
-----------------

- Endpoint: `GET http://localhost:9000/exports/cv`
- Query params:
  - `locale` (optional): `id` atau `en`

Catatan:

- Data CV diambil dari konfigurasi landing (`site-configs`), experience yang published, education yang active, certification yang active, dan skill yang active.
- Foto profile tidak dimasukkan ke CV PDF agar format tetap sederhana dan ATS-friendly.
- Field multi-language akan mengikuti `locale` yang dipilih.

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/exports/cv?locale=id" \
  -H "Accept: application/pdf" \
  --output cv-ats-id.pdf
```

Export Portfolio Detail PDF
---------------------------

- Endpoint: `GET http://localhost:9000/exports/portfolios`
- Query params:
  - `locale` (optional): `id` atau `en`

Catatan:

- File ini berbeda dari CV PDF.
- Data yang diekspor adalah seluruh portfolio dari CMS, termasuk informasi status publish, deskripsi, contribution, outcome, stacks, dan link terkait.
- Field WYSIWYG seperti `contribution` dan `outcome` akan dikonversi menjadi teks biasa agar rapi di PDF.
- Field multi-language akan mengikuti `locale` yang dipilih.

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/exports/portfolios?locale=en" \
  -H "Accept: application/pdf" \
  --output portfolio-detail-en.pdf
```
