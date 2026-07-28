# Arsitektur dan Struktur Folder

- Pattern umum: route, middleware, validation, controller, service, repository.
- Interface/type taruh di src\\model dan export lewat src\\model\\index.ts.
- Setiap repository baru wajib punya contract interface di src\\repository\\contracts dan repository harus implements contract tersebut.
- src\\config: semua config
- src\\controllers: controllers
- src\\helper: helper
- src\\model: interface/type
- src\\repository: query DB / call service lain
- src\\routes: routing per modul (user dan role beda file)
- src\\services: service
- src\\types: types
- src\\validation: validation
- docs: dokumentasi API (contoh curl). Tidak perlu pakai header Cookie.
