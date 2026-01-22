User API
========

Endpoint ini digunakan untuk mengelola data pengguna di backend.

Semua contoh cURL di bawah tidak menggunakan header Cookie. Autentikasi dan otorisasi bisa ditambahkan kemudian sesuai kebutuhan.

Daftar pengguna
---------------

- Endpoint: `GET http://localhost:9000/users`
- Query string:
  - `page` (opsional, default `1`)
  - `page_size` (opsional, default `10`, min `1`, max `100`)
  - `search` (opsional, string; mencari di email dan name, case-insensitive)
  - `order_field` (opsional, salah satu dari: `email`, `name`, `status`, `created_at`, `updated_at`)
  - `order_dir` (opsional, `asc` atau `desc`, default `asc` jika `order_field` diisi)

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/users?page=1&page_size=10" \
  -H "Accept: application/json"
```

Respons sukses:

```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "name": "User Satu",
      "status": true,
      "created_at": "2026-01-18T01:00:00.000Z",
      "updated_at": "2026-01-18T01:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 10,
    "search": null,
    "order_field": null,
    "order_dir": null
  }
}
```

Detail pengguna
---------------

- Endpoint: `GET http://localhost:9000/users/:id`

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/users/1" \
  -H "Accept: application/json"
```

Jika pengguna ditemukan:

```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Satu",
    "status": true,
    "created_at": "2026-01-18T01:00:00.000Z",
    "updated_at": "2026-01-18T01:00:00.000Z"
  }
}
```

Jika pengguna tidak ditemukan:

```json
{
  "errors": [
    "Pengguna tidak ditemukan"
  ]
}
```

Buat pengguna baru
------------------

- Endpoint: `POST http://localhost:9000/users`

Body JSON:

```json
{
  "email": "user@example.com",
  "name": "User Satu",
  "status": true
}
```

Catatan:

- Karena login menggunakan Google OAuth, field `password` **tidak** dikirim dari client. Password akan di-generate oleh system (bisa dikonfigurasi lewat env `SYSTEM_USER_PASSWORD` atau fallback ke `SEED_ADMIN_PASSWORD`).

Contoh cURL:

```bash
curl -X POST "http://localhost:9000/users" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "email": "user@example.com",
    "name": "User Satu",
    "status": true
  }'
```

Respons sukses (201):

```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Satu",
    "status": true,
    "created_at": "2026-01-18T01:00:00.000Z",
    "updated_at": "2026-01-18T01:00:00.000Z"
  }
}
```

Contoh error validasi:

```json
{
  "errors": [
    "String must contain at least 1 character(s)"
  ]
}
```

Contoh error email duplikat:

```json
{
  "errors": [
    "Email sudah terdaftar"
  ]
}
```

Update pengguna
---------------

- Endpoint: `PUT http://localhost:9000/users/:id`

Body JSON:

```json
{
  "name": "Nama Baru"
}
```

Contoh cURL:

```bash
curl -X PUT "http://localhost:9000/users/1" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "name": "Nama Baru"
  }'
```

Respons sukses:

```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "Nama Baru",
    "status": true,
    "created_at": "2026-01-18T01:00:00.000Z",
    "updated_at": "2026-01-18T02:00:00.000Z"
  }
}
```

Update status pengguna
----------------------

Endpoint ini dibuat terpisah khusus untuk mengubah status aktif/nonaktif pengguna.

- Endpoint: `PATCH http://localhost:9000/users/:id/status`

Body JSON:

```json
{
  "status": false
}
```

Contoh cURL:

```bash
curl -X PATCH "http://localhost:9000/users/1/status" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data-raw '{
    "status": false
  }'
```

Respons sukses:

```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Satu",
    "status": false,
    "created_at": "2026-01-18T01:00:00.000Z",
    "updated_at": "2026-01-18T02:00:00.000Z"
  }
}
```

Jika id tidak valid atau pengguna tidak ditemukan, bentuk error mengikuti pola:

```json
{
  "errors": [
    "Pengguna tidak ditemukan"
  ]
}
```

Hapus pengguna
--------------

Endpoint ini digunakan untuk menghapus pengguna berdasarkan id.

- Endpoint: `DELETE http://localhost:9000/users/:id`

Contoh cURL:

```bash
curl -X DELETE "http://localhost:9000/users/1" \
  -H "Accept: application/json"
```

Respons sukses:

```json
{
  "message": "User berhasil dihapus"
}
```

Jika pengguna tidak ditemukan:

```json
{
  "errors": [
    "Pengguna tidak ditemukan"
  ]
}
```

Jika id tidak valid (misalnya `"invalid-id"`), backend akan mengembalikan error validasi dengan bentuk:

```json
{
  "errors": [
    "Pesan error validasi dari Zod"
  ]
}
```
