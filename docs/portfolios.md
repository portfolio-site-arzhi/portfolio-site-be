Portfolios API
==============

Endpoint untuk management data portfolio (CMS) dan endpoint public untuk landing page.

Catatan penting:

- Resource utama disimpan di table `portfolios`.
- Data child disimpan terpisah hanya untuk table `portfolio_stacks`.
- Create dan update portfolio menggunakan `multipart/form-data`.
- Field file gambar adalah `image`; backend menyimpan path upload ke field DB `image`.
- Data non-file dikirim sebagai field multipart `payload` berisi JSON string.
- Field `slug` tidak dikirim dari frontend. Backend membuat slug otomatis dari `title`, misalnya `Ecommerce Dashboard` menjadi `ecommerce-dashboard`.
- Jika hasil slug dari `title` sudah dipakai portfolio lain, backend menambahkan suffix angka seperti `ecommerce-dashboard-2`.
- Upload gambar mengikuti aturan upload project: JPG/JPEG, PNG, atau WebP.
- Untuk update yang berhubungan dengan gambar, `payload.status_file` wajib dikirim.
- `status_file = 0`: gambar tidak berubah.
- `status_file = 1` + ada file `image`: gambar lama diganti gambar baru.
- `status_file = 1` tanpa file `image`: gambar lama dihapus dan field `image` menjadi `null`.
- Sorting di CMS menggunakan `vuedraggable`: backend menyediakan endpoint update sort berdasarkan urutan `ids` array terbaru dari UI.
- `contribution`, `contribution_en`, `outcome`, dan `outcome_en` menerima HTML dari input WYSIWYG dan akan disanitasi backend sebelum disimpan.
- `published_at` menggunakan format datetime ISO 8601, misalnya `2026-04-24T09:00:00.000Z`.
- Endpoint landing hanya mengembalikan data dengan `is_published = true` dan `published_at` sudah aktif (`null` atau `<= now`).
- Jika `BASEURL` dikonfigurasi, response `image` akan berupa URL lengkap. Jika tidak, response `image` berupa path upload seperti `/uploads/portfolio/file.png`.
- Endpoint non-GET (`POST`, `PUT`, `PATCH`, `DELETE`) mengembalikan field `message` yang mendukung `Accept-Language` (`id` / `en`). Jika header tidak dikirim atau tidak didukung, default ke `id`.

List portfolios (CMS)
---------------------

- Endpoint: `GET http://localhost:9000/portfolios`
- Query params:
  - `search` (optional, mencari di `slug`, `title`, `description`, `description_en`, `role`)

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/portfolios?search=dashboard" \
  -H "Accept: application/json"
```

Detail portfolio (CMS)
----------------------

- Endpoint: `GET http://localhost:9000/portfolios/:id`

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/portfolios/1" \
  -H "Accept: application/json"
```

Create portfolio (CMS)
----------------------

- Endpoint: `POST http://localhost:9000/portfolios`
- Content-Type: `multipart/form-data`
- Multipart fields:
  - `payload`: JSON string berisi data portfolio selain gambar.
  - `image`: file gambar portfolio. Wajib saat create.

Catatan:

- `stacks` adalah child array.
- `contribution`, `contribution_en`, `outcome`, dan `outcome_en` adalah field WYSIWYG di table parent.
- Urutan array `stacks` saat create akan menjadi `display_order` masing-masing item (1..n).

Contoh cURL:

```bash
curl -X POST "http://localhost:9000/portfolios" \
  -H "Accept: application/json" \
  -H "Accept-Language: id" \
  -F 'payload={
    "title": "Ecommerce Dashboard",
    "description": "Dashboard analytics untuk toko online",
    "description_en": "Analytics dashboard for ecommerce store",
    "contribution": "<p>Membangun dashboard analytics</p>",
    "contribution_en": "<p>Built analytics dashboard</p>",
    "outcome": "<p>Meningkatkan conversion rate</p>",
    "outcome_en": "<p>Improved conversion rate</p>",
    "role": "Frontend Lead",
    "live_url": "https://demo.example.com/ecommerce-dashboard",
    "github_url": "https://github.com/example/ecommerce-dashboard",
    "is_published": true,
    "published_at": "2026-04-24T09:00:00.000Z",
    "stacks": [
      { "name": "Vue 3" },
      { "name": "PostgreSQL" }
    ]
  }' \
  -F "image=@./sample/portfolio.png;type=image/png"
```

Update portfolio (CMS)
----------------------

- Endpoint: `PUT http://localhost:9000/portfolios/:id`
- Content-Type: `multipart/form-data`
- Multipart fields:
  - `payload`: JSON string berisi field yang ingin diubah.
  - `image`: file gambar portfolio. Kirim hanya jika `status_file = 1` dan gambar ingin diganti.

Catatan:

- `payload.status_file` wajib dikirim pada update.
- Jika `title` dikirim saat update, backend akan menghitung ulang `slug` dari title baru.
- Jika field `stacks` dikirim, child lama akan diganti penuh oleh array baru.
- `contribution`, `contribution_en`, `outcome`, dan `outcome_en` diupdate langsung pada table parent.
- Urutan array `stacks` baru akan menjadi `display_order` child (1..n).

Contoh cURL ganti gambar:

```bash
curl -X PUT "http://localhost:9000/portfolios/1" \
  -H "Accept: application/json" \
  -H "Accept-Language: id" \
  -F 'payload={
    "status_file": 1,
    "title": "Ecommerce Dashboard Revamp",
    "contribution": "<p>Merapikan arsitektur CMS</p>",
    "contribution_en": "<p>Refactored CMS architecture</p>",
    "outcome": "<p>Waktu loading turun 32%</p>",
    "outcome_en": "<p>Loading time reduced by 32%</p>",
    "is_published": true,
    "published_at": "2026-04-25T09:00:00.000Z",
    "stacks": [
      { "name": "Vue 3" },
      { "name": "TypeScript" }
    ]
  }' \
  -F "image=@./sample/portfolio-new.png;type=image/png"
```

Contoh cURL tanpa perubahan gambar:

```bash
curl -X PUT "http://localhost:9000/portfolios/1" \
  -H "Accept: application/json" \
  -H "Accept-Language: id" \
  -F 'payload={
    "status_file": 0,
    "title": "Ecommerce Dashboard Revamp"
  }'
```

Contoh cURL hapus gambar:

```bash
curl -X PUT "http://localhost:9000/portfolios/1" \
  -H "Accept: application/json" \
  -H "Accept-Language: id" \
  -F 'payload={
    "status_file": 1
  }'
```

Delete portfolio (CMS)
----------------------

- Endpoint: `DELETE http://localhost:9000/portfolios/:id`

Contoh cURL:

```bash
curl -X DELETE "http://localhost:9000/portfolios/1" \
  -H "Accept: application/json" \
  -H "Accept-Language: id"
```

Update sort portfolios (CMS)
----------------------------

- Endpoint: `PATCH http://localhost:9000/portfolios/sort`
- Content-Type: `application/json`

Body:

- `ids`: array id parent sesuai urutan terbaru dari UI (`vuedraggable`).

Contoh cURL:

```bash
curl -X PATCH "http://localhost:9000/portfolios/sort" \
  -H "Accept: application/json" \
  -H "Accept-Language: id" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [3, 1, 2]
  }'
```

List portfolios (Landing / Public)
----------------------------------

- Endpoint: `GET http://localhost:9000/landing/portfolios`

Catatan:

- Hanya mengembalikan portfolio yang published dan waktu publish-nya sudah aktif.
- Field multi-language hanya berlaku untuk `description`, `contribution`, dan `outcome`.

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/landing/portfolios" \
  -H "Accept: application/json"
```

Detail portfolio by slug (Landing / Public)
-------------------------------------------

- Endpoint: `GET http://localhost:9000/landing/portfolios/:slug`

Catatan:

- Digunakan oleh frontend untuk halaman `/portfolio/:slug`.
- Jika slug tidak ditemukan, data belum dipublish, atau `published_at` masih di masa depan, endpoint mengembalikan `404`.

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/landing/portfolios/ecommerce-dashboard" \
  -H "Accept: application/json"
```

Contoh response:

```json
{
  "data": {
    "id": 1,
    "slug": "ecommerce-dashboard",
    "display_order": 1,
    "title": "Ecommerce Dashboard",
    "description": {
      "id": "Dashboard analytics untuk toko online",
      "en": "Analytics dashboard for ecommerce store"
    },
    "contribution": {
      "id": "<p>Membangun dashboard analytics</p>",
      "en": "<p>Built analytics dashboard</p>"
    },
    "outcome": {
      "id": "<p>Meningkatkan conversion rate</p>",
      "en": "<p>Improved conversion rate</p>"
    },
    "image": "http://localhost:9000/uploads/portfolio/ecommerce-dashboard.png",
    "role": "Frontend Lead",
    "live_url": "https://demo.example.com/ecommerce-dashboard",
    "github_url": "https://github.com/example/ecommerce-dashboard",
    "stacks": [
      {
        "id": 1,
        "display_order": 1,
        "name": "Vue 3"
      }
    ]
  }
}
```
