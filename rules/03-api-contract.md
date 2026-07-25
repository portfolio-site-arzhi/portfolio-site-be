# Validation dan Error

- Semua validation error harus status 400.
- Bentuk error validation harus seperti ini:
{
  "errors": [
    "The email is required!",
    "The name is required!",
    "The role is required!"
  ]
}
- Usahakan validation hanya di src\\validation (bukan di controller/service).

# Pagination dan Sorting

- Kalau ada endpoint list dengan paging: wajib ada sorting stabil dengan id desc (untuk mencegah data pindah halaman/duplikasi).
- Jika sudah ada sort utama lain: id desc tetap dipakai sebagai tie-breaker.

# Upload File

- Untuk update yang ada upload file: request body wajib punya status_file.
- status_file = 0: tidak ada perubahan file.
- status_file = 1 + ada upload file: ganti file.
- status_file = 1 + tidak ada upload file: hapus file.
