Certifications API
==================

Endpoint untuk management data certification (CMS) dan endpoint public untuk landing page.

Catatan penting:

- `description` dan `description_en` menyimpan HTML dari input WYSIWYG.
- Backend melakukan sanitasi HTML (menghapus script/event handler) sebelum disimpan.
- Sorting di CMS menggunakan vuedraggable: backend menyediakan endpoint update sort berdasarkan urutan `ids` array.
- `issue_date` menggunakan format `YYYY-MM-01` (day selalu `01` untuk representasi bulan).
- Untuk endpoint non-GET (`POST`, `PUT`, `PATCH`, `DELETE`) backend mengembalikan field `message` yang mendukung `Accept-Language` (`id` / `en`). Jika header tidak dikirim atau tidak didukung, default ke `id`.

List certifications (CMS)
------------------------

- Endpoint: `GET http://localhost:9000/certifications`
- Query params:
  - `search` (optional)

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/certifications?search=issuer" \
  -H "Accept: application/json"
```

Detail certification (CMS)
-------------------------

- Endpoint: `GET http://localhost:9000/certifications/:id`

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/certifications/1" \
  -H "Accept: application/json"
```

Create certification (CMS)
-------------------------

- Endpoint: `POST http://localhost:9000/certifications`
- Content-Type: `application/json`

Contoh cURL:

```bash
curl -X POST "http://localhost:9000/certifications" \
  -H "Accept: application/json" \
  -H "Accept-Language: id" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sertifikasi ID",
    "name_en": "Certification EN",
    "issuing_organization": "Issuer Inc",
    "issue_date": "2024-01-01",
    "description": "<p>Deskripsi ID</p>",
    "description_en": "<p>Description EN</p>",
    "is_active": true
  }'
```

Update certification (CMS)
-------------------------

- Endpoint: `PUT http://localhost:9000/certifications/:id`
- Content-Type: `application/json`

Contoh cURL:

```bash
curl -X PUT "http://localhost:9000/certifications/1" \
  -H "Accept: application/json" \
  -H "Accept-Language: id" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "<p>Update deskripsi</p>",
    "is_active": false
  }'
```

Delete certification (CMS)
-------------------------

- Endpoint: `DELETE http://localhost:9000/certifications/:id`

Contoh cURL:

```bash
curl -X DELETE "http://localhost:9000/certifications/1" \
  -H "Accept: application/json" \
  -H "Accept-Language: id"
```

Update sort certifications (CMS)
-------------------------------

- Endpoint: `PATCH http://localhost:9000/certifications/sort`
- Content-Type: `application/json`

Contoh cURL:

```bash
curl -X PATCH "http://localhost:9000/certifications/sort" \
  -H "Accept: application/json" \
  -H "Accept-Language: id" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [3, 1, 2]
  }'
```

Landing certifications (Public)
------------------------------

- Endpoint: `GET http://localhost:9000/landing/certifications`

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/landing/certifications" \
  -H "Accept: application/json"
```
