User API
========

Endpoint ini digunakan untuk mengelola data pengguna di backend.

Semua contoh cURL di bawah tidak menggunakan header Cookie. Autentikasi dan otorisasi bisa ditambahkan kemudian sesuai kebutuhan.

Daftar pengguna
---------------

- Endpoint: `GET http://localhost:9000/users`

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/users" \
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
  ]
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
