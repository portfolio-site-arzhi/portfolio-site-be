Skills API
==========

Endpoint untuk management data skills (CMS) dan endpoint public untuk landing page.

Konsep data:

- Parent data disimpan di table `skill_groups`.
- Child data disimpan di table `skills`.
- API CMS tetap menggunakan resource utama `/skills`.
- Urutan child (`skills.display_order`) mengikuti urutan array `skills` saat create/update parent.
- Untuk endpoint non-GET (`POST`, `PUT`, `PATCH`, `DELETE`) backend mengembalikan field `message` yang mendukung `Accept-Language` (`id` / `en`). Jika header tidak dikirim atau tidak didukung, default ke `id`.

List skills (CMS)
-----------------

- Endpoint: `GET http://localhost:9000/skills`
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

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/skills/1" \
  -H "Accept: application/json"
```

Create skill (CMS)
------------------

- Endpoint: `POST http://localhost:9000/skills`
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

Catatan:

- Delete akan ditolak jika parent masih memiliki child skills (sesuai FK restrict).

Contoh cURL:

```bash
curl -X DELETE "http://localhost:9000/skills/1" \
  -H "Accept: application/json" \
  -H "Accept-Language: id"
```

Update sort skills (CMS)
------------------------

- Endpoint: `PATCH http://localhost:9000/skills/sort`
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

Landing skills (Public)
-----------------------

- Endpoint: `GET http://localhost:9000/landing/skills`

Catatan:

- Hanya mengembalikan parent dengan `is_active = true`.
- Child tidak memiliki field `is_active`, jadi semua child pada parent aktif akan dikembalikan.
- Untuk multi-language, field `name` dikirim sebagai `id` dan `en` dengan nilai sama.

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/landing/skills" \
  -H "Accept: application/json"
```
