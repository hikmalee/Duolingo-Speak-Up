# Duolingo SpeakUp — Website Prototype

Prototype front-end untuk konsep Duolingo SpeakUp. Dibuat sebagai website statis agar mudah dipublikasikan melalui GitHub Pages.

## Isi folder
- `index.html` — struktur halaman dan komponen website.
- `style.css` — tampilan responsif untuk desktop dan ponsel.
- `script.js` — interaksi prototype: navigasi, simulasi room, mini games, speaking challenge, dan progress.

## Cara menjalankan di komputer
1. Ekstrak folder.
2. Buka `index.html` menggunakan browser.
3. Tidak membutuhkan instalasi atau build tools.

## Cara upload ke GitHub Pages
1. Buat repository baru di GitHub, atau buka repository yang ingin digunakan.
2. Upload `index.html`, `style.css`, dan `script.js` ke bagian paling utama (root) repository.
3. Buka **Settings → Pages**.
4. Pada **Build and deployment**, pilih **Deploy from a branch**.
5. Pilih branch `main` dan folder `/ (root)`, lalu tekan **Save**.
6. Tunggu proses deployment. GitHub akan menampilkan alamat website pada bagian Pages.

## Catatan batasan prototype
- Random Discussion Room adalah simulasi pencocokan 4 peserta. Peserta lain bukan pengguna sungguhan.
- Tombol microphone dan camera hanya mengubah status visual; belum mengakses perangkat atau menghubungkan panggilan.
- XP dan progress berjalan sementara selama halaman digunakan, belum tersimpan ke database.
- Belum ada login, akun, backend, moderation, atau real-time communication.
- Google Fonts membutuhkan koneksi internet; jika tidak tersedia, website memakai font sans-serif bawaan.

## Arah pengembangan berikutnya
Untuk membuat room sungguhan yang dapat dipakai banyak orang, dibutuhkan backend, autentikasi, database, matchmaking, dan layanan komunikasi real-time (WebRTC atau penyedia layanan video/audio).
