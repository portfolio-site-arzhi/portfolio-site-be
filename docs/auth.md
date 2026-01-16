Auth API
========

Endpoint ini digunakan oleh frontend (misalnya Vue) untuk login dan mengelola sesi autentikasi.

Semua contoh cURL di bawah **tidak** menggunakan header `Cookie` sesuai aturan dokumentasi. Cookie akan di-set oleh backend melalui header `Set-Cookie` pada response.

Login dengan Google
-------------------

- Endpoint redirect ke Google: `GET http://localhost:9000/auth/google`
- Setelah user selesai login/konfirmasi di Google, Google akan redirect ke callback backend:
  - `http://localhost:9000/auth/google/callback?code=...`

Opsi A (direkomendasikan): backend redirect kembali ke frontend

1. Frontend menampilkan tombol "Login dengan Google".
2. Saat user klik tombol, frontend mengarahkan user ke `http://localhost:9000/auth/google` (misalnya dengan `window.location.href` atau membuka tab baru).
3. User memilih/konfirmasi akun Google di UI Google.
4. Google mengarahkan kembali ke backend (`/auth/google/callback?code=...`).
5. Backend memproses `code`, membuat/memperbarui user di database, meng‑set cookie `access_token` (HttpOnly, Secure berdasarkan environment, SameSite=lax, Path=/), lalu melakukan redirect ke URL frontend yang dikonfigurasi di env:
   - `FRONTEND_URL=http://localhost:3000/` (sesuaikan dengan domain FE sebenarnya).
6. Setelah redirect, sisi frontend sudah memiliki cookie sesi. Untuk request API berikutnya, frontend cukup menggunakan `credentials: "include"` (atau `withCredentials: true` jika pakai Axios); tidak perlu mengirim bearer token secara manual.

Catatan:

- Kalau `FRONTEND_URL` tidak diisi, backend akan mengembalikan JSON `{ access_token, user }` sebagai fallback (berguna untuk Postman / alat debugging), tapi untuk frontend production disarankan selalu menggunakan Opsi A di atas.

Profile pengguna
----------------

Endpoint ini digunakan frontend untuk mengambil data profile user yang sudah login.

- Endpoint: `GET http://localhost:9000/auth/profile`
- Auth: menggunakan cookie `access_token` yang sudah di-set saat proses login (browser akan mengirimkannya otomatis).

Contoh cURL (untuk ilustrasi request dari frontend):

```bash
curl -X GET "http://localhost:9000/auth/profile" \
  -H "Accept: application/json"
```

Contoh response sukses:

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Test User",
    "status": true
  }
}
```

Jika cookie `access_token` tidak ada atau tidak valid, backend akan mengembalikan error dengan bentuk:

```json
{
  "errors": [
    "Token akses tidak ditemukan"
  ]
}
```

atau

```json
{
  "errors": [
    "Token akses tidak valid"
  ]
}
```

Logout
------

Endpoint ini digunakan untuk mengakhiri sesi pengguna dengan menghapus cookie `access_token`.

- Endpoint: `POST http://localhost:9000/auth/logout`
- Auth: Optional (biasanya dengan cookie `access_token` yang ingin dihapus).

Perilaku:
- Backend akan menghapus cookie `access_token` dengan meng-set tanggal kadaluarsa ke masa lalu.
- Mengembalikan pesan sukses.

Contoh cURL:

```bash
curl -X POST "http://localhost:9000/auth/logout" \
  -H "Accept: application/json"
```

Contoh response sukses:

```json
{
  "message": "Logout berhasil"
}
```

Refresh token
-------------

Endpoint ini digunakan frontend untuk meminta access token baru ketika token lama hampir kadaluarsa, tanpa perlu user login ulang.

- Endpoint: `POST http://localhost:9000/auth/refresh-token`
- Auth: menggunakan cookie `access_token` yang sudah di-set sebelumnya.

Contoh cURL (untuk ilustrasi request dari frontend):

```bash
curl -X POST "http://localhost:9000/auth/refresh-token" \
  -H "Accept: application/json"
```

Perilaku:

- Backend akan memverifikasi JWT di cookie `access_token`.
- Jika valid dan user masih aktif, backend akan:
  - Menghasilkan access token baru.
  - Mengirim header `Set-Cookie` baru untuk `access_token`.
  - Mengembalikan JSON berisi token baru.

Contoh response sukses:

```json
{
  "access_token": "jwt_access_token_baru"
}
```

Jika token tidak ada atau tidak valid, bentuk error mengikuti pola:

```json
{
  "errors": [
    "Token akses tidak ditemukan"
  ]
}
```

atau

```json
{
  "errors": [
    "Token akses tidak valid"
  ]
}
```
