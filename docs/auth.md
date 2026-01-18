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
5. Backend memproses `code`, membuat/memperbarui user di database, lalu meng‑set cookie `access_token` dan `refresh_token` (keduanya HttpOnly, Secure berdasarkan environment, SameSite=lax, Path=/), kemudian melakukan redirect ke URL frontend yang dikonfigurasi di env:
   - `FRONTEND_URL=http://localhost:3001/` (sesuaikan dengan domain FE sebenarnya).
6. Setelah redirect, sisi frontend sudah memiliki cookie sesi. Untuk request API berikutnya, frontend cukup menggunakan `credentials: "include"` (atau `withCredentials: true` jika pakai Axios); tidak perlu menyimpan ataupun mengirim bearer token secara manual.

Catatan:

- Kalau `FRONTEND_URL` tidak diisi, backend akan mengembalikan JSON `{ access_token, user }` sebagai fallback (berguna untuk Postman / alat debugging), tapi untuk frontend production disarankan selalu menggunakan Opsi A di atas.

Rekomendasi status login di frontend
-----------------------------------

Secara security, backend **hanya** percaya pada cookie HttpOnly (`access_token` dan `refresh_token`). Backend juga akan meng-set cookie `is_logged_in` (HttpOnly=false, Secure=false, SameSite=lax, Path=/, expired sama dengan `refresh_token`) yang bisa dibaca frontend **hanya untuk keperluan UX**.

Rekomendasi flow:

1. Setelah user selesai login (berhasil redirect dari backend dan request `GET /auth/profile` sukses), backend otomatis meng-set cookie `is_logged_in = "true"`. Frontend boleh menggunakan nilai ini sebagai indikator awal bahwa user seharusnya sudah login.
2. Untuk setiap request ke endpoint yang butuh login:
   - Kirim request dengan `credentials: "include"` / `withCredentials: true`.
   - Jika response `401` atau `403`, anggap sesi sudah tidak valid:
     - Hapus / set `is_logged_in = false`.
     - Redirect user ke halaman login.
3. Dengan pattern ini, kalau ada yang memanipulasi `is_logged_in = true` secara manual, backend tetap akan menolak request karena token HttpOnly tidak valid. Frontend akan menerima `401/403`, lalu otomatis menghapus `is_logged_in` dan mengarahkan kembali ke halaman login.

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

Endpoint ini digunakan untuk mengakhiri sesi pengguna dengan menghapus cookie sesi dan mencabut refresh token untuk sesi tersebut.

- Endpoint: `POST http://localhost:9000/auth/logout`
- Auth: Optional (biasanya dengan cookie `access_token` dan/atau `refresh_token` yang ingin dihapus).

Perilaku:
- Backend akan menghapus cookie `access_token`, `refresh_token`, dan `is_logged_in` dengan meng-set tanggal kadaluarsa ke masa lalu.
- Jika terdapat cookie `refresh_token` yang valid, backend juga akan menghapus refresh token tersebut di database. Refresh token lain milik user yang sama (sesi lain/multi-login) tetap dipertahankan.
- Jika cookie `access_token` dan `refresh_token` tidak ada atau tidak valid, backend tetap mengembalikan response sukses (idempotent) dan memastikan tidak ada cookie sesi yang tertinggal.

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
- Auth: menggunakan cookie `refresh_token` yang sudah di-set saat proses login (browser akan mengirimkannya otomatis).

Contoh cURL (untuk ilustrasi request dari frontend):

```bash
curl -X POST "http://localhost:9000/auth/refresh-token" \
  -H "Accept: application/json"
```

Perilaku:

- Backend akan membaca dan memverifikasi `refresh_token` dari cookie (termasuk cek ke database dan status user).
- Jika valid dan user masih aktif, backend akan:
  - Menghasilkan access token baru.
  - Menghasilkan refresh token baru.
  - Mengirim header `Set-Cookie` baru untuk `access_token`, `refresh_token`, dan `is_logged_in`.
  - Mengembalikan JSON berisi access token baru (utama untuk keperluan debugging / Postman).

Contoh response sukses:

```json
{
  "access_token": "jwt_access_token_baru"
}
```

Jika refresh token tidak ada atau tidak valid, bentuk error mengikuti pola:

```json
{
  "errors": [
    "Refresh token tidak ditemukan"
  ]
}
```

atau

```json
{
  "errors": [
    "Refresh token tidak valid"
  ]
}
```
