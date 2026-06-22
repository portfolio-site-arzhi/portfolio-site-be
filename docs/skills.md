Skills API
==========

Endpoint untuk management data skills (CMS) dan endpoint public untuk landing page.

Konsep data:

- Parent data disimpan di table `skill_groups`.
- Child data disimpan di table `skills`.
- API CMS tetap menggunakan resource utama `/skills`.
- Urutan child (`skills.display_order`) mengikuti urutan array `skills` saat create/update parent.
- Endpoint `POST /skills/import` menggunakan upload file Excel (`.xlsx`) dan hanya menambahkan data baru.
- Endpoint `GET /skills/export` mengembalikan file Excel (`.xlsx`) dengan 2 sheet relasional: `skill_groups` dan `skills`.
- Untuk endpoint non-GET (`POST`, `PUT`, `PATCH`, `DELETE`) backend mengembalikan field `message` yang mendukung `Accept-Language` (`id` / `en`). Jika header tidak dikirim atau tidak didukung, default ke `id`.

List skills (CMS)
-----------------

- Endpoint: `GET http://localhost:9000/skills`
- Auth: Required (login)
- Query params:
  - `search` (optional, mencari di `skill_groups.name` dan `skills.name`)

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/skills?search=front" \
  -H "Accept: application/json"
```

Detail skill (CMS)
------------------

- Endpoint: `GET http://localhost:9000/skills/:id`
- Auth: Required (login)

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/skills/1" \
  -H "Accept: application/json"
```

Create skill (CMS)
------------------

- Endpoint: `POST http://localhost:9000/skills`
- Auth: Required (login)
- Content-Type: `application/json`

Catatan:

- `skills` adalah child array.
- Urutan elemen array akan menjadi `display_order` (1..n) di table child.

Contoh cURL:

```bash
curl -X POST "http://localhost:9000/skills" \
  -H "Accept: application/json" \
  -H "Accept-Language: id" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend",
    "is_active": true,
    "skills": [
      { "name": "Vue.js" },
      { "name": "TypeScript" },
      { "name": "Nuxt" }
    ]
  }'
```

Update skill (CMS)
------------------

- Endpoint: `PUT http://localhost:9000/skills/:id`
- Auth: Required (login)
- Content-Type: `application/json`

Catatan:

- Jika field `skills` dikirim, child lama akan diganti penuh oleh array baru.
- Urutan array baru akan menjadi `display_order` child (1..n).

Contoh cURL:

```bash
curl -X PUT "http://localhost:9000/skills/1" \
  -H "Accept: application/json" \
  -H "Accept-Language: id" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Frontend Engineering",
    "is_active": true,
    "skills": [
      { "name": "TypeScript" },
      { "name": "Vue.js" }
    ]
  }'
```

Delete skill (CMS)
------------------

- Endpoint: `DELETE http://localhost:9000/skills/:id`
- Auth: Required (login)

Catatan:

- Saat parent skill dihapus, semua child skill di bawahnya akan ikut terhapus dalam transaction yang sama.

Contoh cURL:

```bash
curl -X DELETE "http://localhost:9000/skills/1" \
  -H "Accept: application/json" \
  -H "Accept-Language: id"
```

Update sort skills (CMS)
------------------------

- Endpoint: `PATCH http://localhost:9000/skills/sort`
- Auth: Required (login)
- Content-Type: `application/json`

Body:

- `ids`: array id parent sesuai urutan terbaru dari UI (`vuedraggable`).

Contoh cURL:

```bash
curl -X PATCH "http://localhost:9000/skills/sort" \
  -H "Accept: application/json" \
  -H "Accept-Language: id" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [3, 1, 2]
  }'
```

Export skills untuk bahan import (CMS)
--------------------------------------

- Endpoint: `GET http://localhost:9000/skills/export`
- Auth: Required (login)

Catatan:

- Response berupa file Excel download dengan `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
- Backend mengirim header `Content-Disposition: attachment`.
- Workbook memiliki tepat 2 sheet:
  - `skill_groups`
  - `skills`
- Sheet `skill_groups` memiliki kolom:
  - `code`
  - `name`
- Sheet `skills` memiliki kolom:
  - `group_code`
  - `name`
- Relasi child ke parent menggunakan `group_code` yang harus mengacu ke `code` yang sama pada sheet `skill_groups`.
- Saat import, sistem akan mengabaikan spasi pada `code` dan `group_code`, lalu membacanya dalam lowercase sebelum mencocokkan relasi.
- Backend membuat `code` export otomatis tanpa spasi. Format default berupa slug lowercase seperti `frontend`, `backend`, atau `devops-tools`.
- File hasil export bisa langsung dipakai ke endpoint `POST /skills/import`.

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/skills/export" \
  -H "Accept: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" \
  --output skills-export.xlsx
```

Contoh isi sheet `skill_groups`:

| code | name |
| --- | --- |
| frontend | Frontend |
| tools | Tools |

Contoh isi sheet `skills`:

| group_code | name |
| --- | --- |
| frontend | Vue.js |
| frontend | TypeScript |
| tools | Git |

Import skills dari file Excel (CMS)
-----------------------------------

- Endpoint: `POST http://localhost:9000/skills/import`
- Auth: Required (login)
- Content-Type: `multipart/form-data`

Catatan:

- Endpoint ini hanya menambahkan (`insert`) parent dan child skill baru.
- Data skill yang sudah ada tidak akan diubah atau dihapus.
- Parent hasil import akan ditambahkan di urutan paling bawah setelah data existing.
- Backend hanya membaca 2 sheet:
  - `skill_groups`
  - `skills`
- Urutan row pada sheet `skill_groups` akan menjadi urutan parent skill yang diinsert.
- Urutan row child pada sheet `skills` untuk `group_code` yang sama akan menjadi urutan child skill yang diinsert.
- Field upload yang digunakan adalah `file`.
- Field `is_active` tidak perlu ada di file import; semua data hasil import otomatis disimpan sebagai aktif (`is_active = true`).
- `code` pada sheet `skill_groups` dan `group_code` pada sheet `skills` harus mengacu ke kode yang sama setelah normalisasi sistem.
- Spasi pada `code` dan `group_code` akan dibersihkan otomatis saat import.
- Setelah dibersihkan, sistem akan membaca `code` dan `group_code` dalam lowercase.
- Setelah dibersihkan, `code` dan `group_code` hanya boleh berisi huruf, angka, strip (`-`), atau underscore (`_`).
- Jika `group_code` pada sheet `skills` tidak ditemukan pada sheet `skill_groups`, import akan ditolak dengan status 400.

Contoh cURL:

```bash
curl -X POST "http://localhost:9000/skills/import" \
  -H "Accept: application/json" \
  -H "Accept-Language: id" \
  -F "file=@skills-export.xlsx;type=application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
```

Landing skills (Public)
-----------------------

- Endpoint: `GET http://localhost:9000/landing/skills`
- Auth: Tidak diperlukan (public)

Catatan:

- Hanya mengembalikan parent dengan `is_active = true`.
- Child tidak memiliki field `is_active`, jadi semua child pada parent aktif akan dikembalikan.
- Untuk multi-language, field `name` dikirim sebagai `id` dan `en` dengan nilai sama.

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/landing/skills" \
  -H "Accept: application/json"
```
