# TikTok Live Monitor

Aplikasi web sederhana untuk memantau statistik siaran langsung (live) TikTok secara real-time. Masukkan username TikTok yang sedang live untuk melihat jumlah penonton, suka, pembagian, serta daftar hadiah dan komentar terbaru.

![Screenshot](tiktok-live-monitor-01.jpg)

## Fitur Utama

-   **Real-Time Update**: Statistik diperbarui secara otomatis tanpa perlu me-refresh halaman.
-   **Statistik Utama**: Lacak jumlah penonton, suka (likes), dan pembagian (shares).
-   **Interaksi Pengguna**: Tampilkan daftar hadiah (gifts) dan komentar yang masuk.
-   **Antarmuka Sederhana**: Cukup masukkan username untuk terhubung.
-   **Desain Modern**: Tampilan dengan tema gelap yang modern dan mudah dibaca.

## Teknologi yang Digunakan

-   **Backend**: Node.js, Express, Socket.IO
-   **Frontend**: HTML, CSS, JavaScript (client-side)
-   **TikTok API**: Menggunakan library `tiktok-live-connector` untuk terhubung ke siaran langsung TikTok.

## Cara Menjalankan

1.  **Clone repository ini** (jika ada di git) atau unduh file proyek.

2.  **Install dependensi**
    Buka terminal di direktori proyek dan jalankan:
    ```bash
    npm install
    ```

3.  **Jalankan server**
    Setelah instalasi selesai, jalankan perintah berikut:
    ```bash
    node index.js
    ```

4.  **Buka di browser**
    Buka browser dan akses alamat `http://localhost:3000`.

5.  **Mulai Memantau**
    Masukkan username TikTok yang sedang melakukan siaran langsung dan klik "CONNECT".

## Penyelesaian Masalah (Troubleshooting)

-   **Koneksi Gagal ("Failed to connect")**: Pastikan username TikTok yang dimasukkan sudah benar, tidak menggunakan simbol `@`, dan pengguna tersebut sedang melakukan siaran langsung (live).
-   **Statistik tidak update**: Coba refresh halaman atau putuskan koneksi lalu sambungkan kembali.

## Kredit (Credits)

Dibuat oleh **Faris AY** ([Instagram](https://instagram.com/faris.a.y) | [Threads](https://threads.net/@faris.a.y)).

## Lisensi

Proyek ini dilisensikan di bawah Lisensi MIT.
