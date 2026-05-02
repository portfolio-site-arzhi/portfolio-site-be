Site Configuration API
======================

Endpoint ini digunakan untuk mengelola konfigurasi website seperti warna tema, data profil, dan footer untuk landing page portfolio.

Multi-language hanya digunakan pada dua field konten:

- `home.description` (teks deskripsi di halaman Home)
- `about.about_me` (teks "tentang saya" di halaman About)
- Untuk endpoint non-GET (`POST /site-configs/bulk`) backend mengembalikan field `message` yang mendukung `Accept-Language` (`id` / `en`). Jika header tidak dikirim atau tidak didukung, default ke `id`.

List semua konfigurasi
----------------------

Endpoint ini digunakan oleh frontend untuk mengambil semua data konfigurasi landing dalam satu request (sudah digabung per bagian: system, home, about, footer).

- Endpoint: `GET http://localhost:9000/site-configs`
- Auth: Tidak diperlukan (public)

Catatan:

- Field `photo` pada tipe `home` akan selalu dikembalikan sebagai URL penuh berdasarkan env `BASEURL` (contoh: `http://localhost:9000/uploads/profile/profile-123.png`). Jika nilai di database berupa path relatif (misalnya `/uploads/profile/profile-123.png`), backend akan otomatis menambahkan prefix `BASEURL` sebelum mengembalikannya ke client.

Contoh cURL:

```bash
curl -X GET "http://localhost:9000/site-configs" \
  -H "Accept: application/json"
```

Struktur response:

- Selalu ada key `data` di root.
- Di dalam `data` ada empat blok utama: `system`, `home`, `about`, `footer`.
- Masing-masing blok bisa berisi objek konfigurasi atau `null` jika belum pernah diisi.

Contoh response lengkap ketika semua konfigurasi sudah diisi:

```json
{
  "data": {
    "system": {
      "primary_color": "#1976D2",
      "secondary_color": "#42A5F5"
    },
    "home": {
      "name": "Nama Anda",
      "position": "Full Stack Developer",
      "description": {
        "id": "Deskripsi profil singkat dalam bahasa Indonesia",
        "en": "Short profile description in English"
      },
      "photo": "http://localhost:9000/uploads/profile/profile-123.png"
    },
    "about": {
      "about_me": {
        "id": "Saya adalah software engineer yang fokus pada pengembangan web.",
        "en": "I am a software engineer focusing on web development."
      },
      "email": "id@example.com",
      "address": "Jakarta, Indonesia"
    },
    "footer": {
      "github": "https://github.com/username",
      "linkedin": "https://linkedin.com/in/username",
      "instagram": "https://instagram.com/username"
    }
  }
}
```

Contoh response ketika beberapa bagian belum di-set:

```json
{
  "data": {
    "system": null,
    "home": {
      "name": "Nama Anda",
      "position": "Full Stack Developer",
      "description": {
        "id": "Deskripsi profil singkat dalam bahasa Indonesia",
        "en": "Short profile description in English"
      },
      "photo": null
    },
    "about": null,
    "footer": null
  }
}
```

Bulk simpan / update semua konfigurasi
--------------------------------------

Endpoint ini digunakan untuk menyimpan seluruh konfigurasi landing (`system`, `home`, `about`, `footer`) dalam satu request.
Endpoint ini bersifat upsert untuk setiap kombinasi `type` dan `locale` di dalam payload:
- Jika belum ada konfigurasi untuk kombinasi tersebut, data akan dibuat.
- Jika sudah ada, semua key lama untuk kombinasi itu akan dihapus dan digantikan oleh payload `value` yang baru.

- Endpoint: `POST http://localhost:9000/site-configs/bulk`
- Auth: Required (login)
- Content-Type: `multipart/form-data`

Contoh body bulk (sekali request untuk semua konfigurasi):

Request body:

Catatan:

- Contoh di bawah hanya menggambarkan struktur JSON logical.
- Field `photo` berisi string URL/path yang tersimpan di database, bukan file binary.
- Saat menggunakan multipart dengan upload file, nilai `photo` biasanya tidak dikirim di payload; nilai tersebut akan diisi atau dihapus otomatis berdasarkan kombinasi `status_file` dan file yang diupload.
- Ukuran file `home_photo` maksimal `5MB` per file.
- Saat data dikembalikan ke client (baik melalui `GET /site-configs` maupun setelah `POST /site-configs/bulk`), jika field `photo` berisi path relatif (misalnya `/uploads/profile/profile-123.png`), backend akan mengonversinya menjadi URL penuh menggunakan env `BASEURL`.

```json
{
  "system": {
    "primary_color": "#1976D2",
    "secondary_color": "#42A5F5"
  },
  "home": {
    "status_file": 0,
    "value": {
      "name": "Nama Anda",
      "position": "Full Stack Developer",
      "description": {
        "id": "Deskripsi profil singkat dalam bahasa Indonesia",
        "en": "Short profile description in English"
      },
      "photo": "https://example.com/profile-photo.jpg"
    }
  },
  "about": {
    "value": {
      "about_me": {
        "id": "Saya adalah software engineer yang fokus pada pengembangan web.",
        "en": "I am a software engineer focusing on web development."
      },
      "email": "id@example.com",
      "address": "Jakarta, Indonesia"
    }
  },
  "footer": {
    "value": {
      "github": "https://github.com/username",
      "linkedin": "https://linkedin.com/in/username",
      "instagram": "https://instagram.com/username"
    }
  }
}
```

Contoh cURL:

```bash
curl -X POST "http://localhost:9000/site-configs/bulk" \
  -H "Accept: application/json" \
  -H "Accept-Language: id" \
  -F 'payload={
    "system": {
      "primary_color": "#1976D2",
      "secondary_color": "#42A5F5"
    },
    "home": {
      "status_file": 1,
      "value": {
        "name": "Nama Anda",
        "position": "Full Stack Developer",
        "description": {
          "id": "Deskripsi profil singkat dalam bahasa Indonesia",
          "en": "Short profile description in English"
        }
      }
    },
    "about": {
      "value": {
        "about_me": {
          "id": "Saya adalah software engineer yang fokus pada pengembangan web.",
          "en": "I am a software engineer focusing on web development."
        },
        "email": "id@example.com",
        "address": "Jakarta, Indonesia"
      }
    },
    "footer": {
      "value": {
        "github": "https://github.com/username",
        "linkedin": "https://linkedin.com/in/username",
        "instagram": "https://instagram.com/username"
      }
    }
  }' \
  -F "home_photo=@/path/to/profile-photo.jpg"
```

Catatan:

- `status_file = 0`: Tidak ada perubahan foto profile.
- `status_file = 1` dengan file di field `home_photo`: Ganti foto dengan file baru untuk bahasa Indonesia dan English sekaligus.
- `status_file = 1` tanpa file `home_photo`: Hapus foto yang tersimpan (field `photo` di konfigurasi akan dihapus untuk kedua bahasa).
- Jika `status_file = 1` dan sebelumnya sudah ada foto yang tersimpan, file gambar lama di folder upload (`uploads/profile`) akan dihapus ketika:
  - Foto diganti dengan file baru (`home_photo` diupload), atau
  - Foto dihapus (tidak ada file `home_photo` yang dikirim).

Saran format file gambar:

- Disarankan menggunakan file dengan ekstensi: `.jpg`, `.jpeg`, `.png`, atau `.webp`.
- File dengan tipe lain akan ditolak dengan respons HTTP 400 dan pesan error:
  `["Tipe file gambar tidak didukung. Gunakan JPG, JPEG, PNG, atau WebP"]`.

Tipe Konfigurasi
----------------

Berikut adalah tipe konfigurasi yang tersedia:

- **system**: Konfigurasi sistem (warna tema, dll)
  - Fields: `primary_color`, `secondary_color`
  - Catatan: `locale` harus `null` (tidak multi-language)
- **home**: Konfigurasi halaman home
  - Fields: `name`, `position`, `description`, `photo`
  - Catatan: Multi-language **hanya** pada teks `description` (punya versi `id` dan `en`). Field lain (`name`, `position`, `photo`) dianggap single value dan digunakan untuk kedua bahasa.
- **about**: Konfigurasi halaman about
  - Fields: `about_me`, `email`, `address`
  - Catatan: Multi-language **hanya** pada teks `about_me` (punya versi `id` dan `en`). Field `email` dan `address` adalah single value.
- **footer**: Konfigurasi footer
  - Fields: `github`, `linkedin`, `instagram`
  - Catatan: Tidak ada field multi-language di payload; semua link dianggap single value dan dipakai untuk semua bahasa.

Contoh value untuk setiap type:

```json
{
  "system": {
    "primary_color": "#1976D2",
    "secondary_color": "#42A5F5"
  },
  "home": {
    "name": "Nama Anda",
    "position": "Developer",
    "description": "Deskripsi profil Anda",
    "photo": "https://example.com/photo.jpg"
  },
  "about": {
    "about_me": "Tentang saya...",
    "email": "email@example.com",
    "address": "Jakarta, Indonesia"
  },
  "footer": {
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "instagram": "https://instagram.com/username"
  }
}
```
