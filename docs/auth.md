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
