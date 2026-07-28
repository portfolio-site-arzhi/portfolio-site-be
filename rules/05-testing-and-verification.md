# Testing

- Setiap test case (it) wajib refresh database biar terisolasi.
- Kalau ada perubahan, cek apakah perubahan bisa diuji dengan integration test; kalau bisa dan belum ada, buat test flow-nya.
- Jangan buat test manual; jalankan integration test yang ada.
- Jalankan test yang diperlukan saja agar tidak lama.
- Basic command test: npm run test:local
