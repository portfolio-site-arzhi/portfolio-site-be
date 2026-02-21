Educations API
==============

Endpoint untuk management data education (CMS) dan endpoint public untuk landing page.

Catatan penting:

- `description` dan `description_en` menyimpan HTML dari input WYSIWYG.
- Backend melakukan sanitasi HTML (menghapus script/event handler) sebelum disimpan.
- Sorting di CMS menggunakan vuedraggable: backend menyediakan endpoint update sort berdasarkan urutan `ids` array.
- `start_date` dan `end_date` menggunakan format `YYYY-MM-01` (day selalu `01` untuk representasi bulan).

List educations (CMS)
--------------------

- Endpoint: `GET http://localhost:9000/educations`
- Query params:
  - `search` (optional)

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/educations?search=institut" \
  -H "Accept: application/json"
```

Detail education (CMS)
---------------------

- Endpoint: `GET http://localhost:9000/educations/:id`

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/educations/1" \
  -H "Accept: application/json"
```

Create education (CMS)
---------------------

- Endpoint: `POST http://localhost:9000/educations`
- Content-Type: `application/json`

Contoh cURL:

```bash
curl -X POST "http://localhost:9000/educations" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "institution_name": "Institut Teknologi",
    "degree": "Sarjana",
    "degree_en": "Bachelor",
    "field_of_study": "Informatika",
    "field_of_study_en": "Computer Science",
    "start_date": "2018-08-01",
    "end_date": "2022-07-01",
    "description": "<p>Deskripsi ID</p>",
    "description_en": "<p>Description EN</p>",
    "location": "Bandung, Indonesia",
    "is_active": true
  }'
```

Update education (CMS)
---------------------

- Endpoint: `PUT http://localhost:9000/educations/:id`
- Content-Type: `application/json`

Contoh cURL:

```bash
curl -X PUT "http://localhost:9000/educations/1" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "<p>Update deskripsi</p>",
    "is_active": false
  }'
```

Delete education (CMS)
---------------------

- Endpoint: `DELETE http://localhost:9000/educations/:id`

Contoh cURL:

```bash
curl -X DELETE "http://localhost:9000/educations/1" \
  -H "Accept: application/json"
```

Update sort educations (CMS)
---------------------------

- Endpoint: `PATCH http://localhost:9000/educations/sort`
- Content-Type: `application/json`

Contoh cURL:

```bash
curl -X PATCH "http://localhost:9000/educations/sort" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [3, 1, 2]
  }'
```

Landing educations (Public)
--------------------------

- Endpoint: `GET http://localhost:9000/landing/educations`

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/landing/educations" \
  -H "Accept: application/json"
```
