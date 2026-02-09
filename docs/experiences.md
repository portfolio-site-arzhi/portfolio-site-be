Experiences API
===============

Endpoint untuk management data experience (CMS) dan endpoint public untuk landing page.

Catatan penting:

- `description_id` dan `description_en` menyimpan HTML dari input WYSIWYG.
- Backend melakukan sanitasi HTML (menghapus script/event handler) sebelum disimpan.
- Sorting di CMS menggunakan vuedraggable: backend menyediakan endpoint update sort berdasarkan urutan `ids` array.
- `start_date` dan `end_date` menggunakan format `YYYY-MM-01` (day selalu `01` untuk representasi bulan).

List experiences (CMS)
---------------------

- Endpoint: `GET http://localhost:9000/experiences`
- Query params:
  - `search` (optional)

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/experiences?search=developer" \
  -H "Accept: application/json"
```

Contoh response:

```json
{
  "data": [
    {
      "id": 1,
      "sort": 1,
      "is_published": true,
      "role_id": "Senior Frontend Developer",
      "role_en": "Senior Frontend Developer",
      "company_name": "Tech Solutions Inc.",
      "company_url": "https://example.com",
      "start_date": "2023-07-01",
      "end_date": null,
      "is_current": true,
      "description_id": "<p>Memimpin migrasi...</p>",
      "description_en": "<p>Led the migration...</p>",
      "skills": [
        {
          "id": 1,
          "skill_name": "TypeScript",
          "sort": 1
        }
      ],
      "created_at": "2026-01-05T10:15:00.000Z",
      "updated_at": "2026-01-05T10:15:00.000Z"
    }
  ]
}
```

Detail experience (CMS)
----------------------

- Endpoint: `GET http://localhost:9000/experiences/:id`

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/experiences/1" \
  -H "Accept: application/json"
```

Contoh response:

```json
{
  "data": {
    "id": 1,
    "sort": 1,
    "is_published": true,
    "role_id": "Senior Frontend Developer",
    "role_en": "Senior Frontend Developer",
    "company_name": "Tech Solutions Inc.",
    "company_url": "https://example.com",
    "start_date": "2023-07-01",
    "end_date": null,
    "is_current": true,
    "description_id": "<p>Memimpin migrasi...</p>",
    "description_en": "<p>Led the migration...</p>",
    "skills": [
      {
        "id": 1,
        "skill_name": "TypeScript",
        "sort": 1
      }
    ],
    "created_at": "2026-01-05T10:15:00.000Z",
    "updated_at": "2026-01-05T10:15:00.000Z"
  }
}
```

Create experience (CMS)
----------------------

- Endpoint: `POST http://localhost:9000/experiences`
- Content-Type: `application/json`

Contoh cURL:

```bash
curl -X POST "http://localhost:9000/experiences" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "is_published": true,
    "role_id": "Senior Frontend Developer",
    "role_en": "Senior Frontend Developer",
    "company_name": "Tech Solutions Inc.",
    "company_url": "https://example.com",
    "start_date": "2023-07-01",
    "end_date": null,
    "is_current": true,
    "description_id": "<p>Memimpin migrasi...</p>",
    "description_en": "<p>Led the migration...</p>",
    "skills": [
      { "skill_name": "TypeScript" },
      { "skill_name": "Vue" }
    ]
  }'
```

Update experience (CMS)
----------------------

- Endpoint: `PUT http://localhost:9000/experiences/:id`
- Content-Type: `application/json`

Catatan:

- Jika field `skills` dikirim, urutan array `skills` akan menjadi urutan sorting skill (1..n).

Contoh cURL:

```bash
curl -X PUT "http://localhost:9000/experiences/1" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "is_published": true,
    "description_id": "<p>Update konten...</p>",
    "skills": [
      { "skill_name": "TypeScript" }
    ]
  }'
```

Delete experience (CMS)
----------------------

- Endpoint: `DELETE http://localhost:9000/experiences/:id`

Contoh cURL:

```bash
curl -X DELETE "http://localhost:9000/experiences/1" \
  -H "Accept: application/json"
```

Update sort experiences (CMS)
----------------------------

- Endpoint: `PATCH http://localhost:9000/experiences/sort`
- Content-Type: `application/json`

Body:

- `ids`: array id berdasarkan urutan terbaru dari UI (hasil vuedraggable).

Contoh cURL:

```bash
curl -X PATCH "http://localhost:9000/experiences/sort" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [3, 1, 2]
  }'
```

List experiences (Landing / Public)
----------------------------------

- Endpoint: `GET http://localhost:9000/landing/experiences`

Catatan:

- Hanya mengembalikan experiences dengan `is_published = true`.
- Field yang dilokalisasi (selalu mengembalikan 2 locale):
  - `role`: `{ id, en }`
  - `description`: `{ id, en }`

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/landing/experiences" \
  -H "Accept: application/json"
```

Contoh response:

```json
{
  "data": [
    {
      "id": 1,
      "sort": 1,
      "role": {
        "id": "Jabatan ID",
        "en": "Role EN"
      },
      "company_name": "Company Public",
      "company_url": null,
      "start_date": "2023-07-01",
      "end_date": null,
      "is_current": true,
      "description": {
        "id": "<p>Deskripsi ID</p>",
        "en": "<p>Description EN</p>"
      },
      "skills": [
        {
          "id": 1,
          "skill_name": "TypeScript",
          "sort": 1
        }
      ]
    }
  ]
}
```
