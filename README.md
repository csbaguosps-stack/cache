# 🧹 Auto History Wipe - Chrome Extension & PHP MVC Backend

> **Ekstensi Pembersih Riwayat & Data Privasi Browser Otomatis** dilengkapi **Dashboard Admin PHP (Arsitektur MVC)** untuk sinkronisasi konfigurasi terpusat.
> 
> **Copyright &copy; 2026 by [cs.baguosps@gmail.com](mailto:cs.baguosps@gmail.com)**. All rights reserved.  
> **GitHub Repository:** [https://github.com/csbaguosps-stack/cache](https://github.com/csbaguosps-stack/cache)

---

## 📌 Ringkasan Proyek

**Auto History Wipe** adalah ekosistem manajemen privasi browser lengkap yang terdiri dari:
1. **Chrome Extension (Manifest V3):** Ekstensi browser modern dengan tema **Putih - Biru** (*Clean White & Royal Blue Modern UI*) untuk membersihkan cache, cookies, riwayat penjelajahan, download, kata sandi, dan data formulir secara otomatis.
2. **PHP Backend & Admin Dashboard (MVC):** Sistem backend berbasis PHP Native murni dengan pola **Model-View-Controller (MVC)** yang dapat di-hosting di server/hosting Anda (atau dijalankan di XAMPP lokal). Dashboard ini dirancang khusus tanpa login sehingga admin dapat langsung mengubah pengaturan kapan saja.
3. **Auto-Sync & Remote Control:** Setiap kali admin mengubah konfigurasi atau memicu *Force Wipe* dari dashboard web, semua ekstensi yang terpasang pada browser client akan **otomatis tersinkronisasi dan diperbarui**!

---

## ✨ Fitur-Fitur Utama

### 1. 🖥️ Dashboard Admin PHP (Metode MVC - Tanpa Login)
- **URL Dashboard:** `http://localhost/chace/` atau domain hosting Anda
- **Tanpa Form Login:** Akses instan langsung ke pusat kendali.
- **Ubah Semua Pengaturan:**
  - Status Ekstensi Global (Master On / Off).
  - Pilihan Rentang Waktu: 1 Day, 3 Days, 1 Week, 1 Month, All Time, atau Custom Days.
  - Pilihan Jenis Data: Browsing History, Download History, Cache, Cookies, Local Storage, Passwords, Form Data.
  - Pembersihan saat browser ditutup (*Auto Clear on Close*).
  - Interval pembersihan berkala (*Timed Auto-Clear*: Menit / Jam / Hari).
  - Nomor versi ekstensi & Domain Server.
- ⚡ **Remote Force Wipe:** Satu klik tombol merah untuk memicu pembersihan data secara paksa seketika di semua browser pengguna yang terhubung.
- 📦 **One-Click ZIP Downloader:** Unduh paket ekstensi siap pakai langsung dari dashboard.
- 🔄 **Endpoint Auto-Update (`updates.xml`):** Mendukung protokol resmi pembaruan otomatis ekstensi Google Chrome.

### 2. 🕒 Ekstensi Chrome (Manifest V3)
- **Pembersihan Otomatis Latar Belakang:** Dijalankan oleh Service Worker menggunakan `chrome.browsingData.remove` dan `chrome.alarms`.
- **Ikon Toolbar Bersih & Tajam:** Ikon resolusi tinggi (16px, 32px, 48px, 128px) antialiasing tajam tanpa terhalang badge besar yang mengganggu.
- **⚡ Tombol Auto Reload Langsung di Ekstensi:** Pengguna maupun admin tidak perlu repot membuka halaman `chrome://extensions/` untuk me-reload ekstensi saat ada kode atau versi baru. Cukup klik tombol **Reload** langsung dari dalam Popup maupun Halaman Settings!
- **Deteksi Versi Baru Otomatis:** Kartu reload di popup akan otomatis berubah menjadi kuning dengan tanda *Update vX.X.X Siap!* jika versi di server dashboard lebih baru dari versi ekstensi yang sedang aktif.
- **Halaman Pengaturan Lengkap (`options.html`):** Pengaturan individual per pengguna dengan indikator status sinkronisasi ke server dashboard dan tombol *⚡ Reload Ekstensi*.
- **Menu Popup Cepat (`popup.html`):** Tampilan status real-time, live countdown timer badge, tombol *Clear Data Now*, dan tombol *⚡ Reload*.

---

## 🏗️ Arsitektur MVC Backend PHP

```text
c:\xampp\htdocs\chace\
├── app/
│   ├── Controllers/
│   │   ├── AdminController.php   # Mengelola Dashboard, Simpan Data, Force Wipe, Download ZIP
│   │   └── ApiController.php     # Endpoint REST API JSON (/api/config) & updates.xml
│   ├── Models/
│   │   └── SettingsModel.php     # Abstraksi data, baca/tulis config/settings.json
│   └── Views/
│       ├── layouts/
│       │   ├── header.php        # Topbar & navigasi bertema putih-biru
│       │   └── footer.php        # Copyright & metadata domain
│       └── admin/
│           └── dashboard.php     # Halaman utama kontrol panel admin
├── config/
│   ├── config.php                # Definisi konstanta path, base URL, versi
│   └── settings.json             # Penyimpanan konfigurasi JSON terpusat
├── public/
│   ├── css/
│   │   └── admin.css             # Desain modern white-blue dashboard
│   └── js/
│       └── admin.js              # Interaktivitas pills, switch, checkbox toggle
├── index.php                     # Front Controller & Router
├── .htaccess                     # URL rewriting untuk Apache / Web Hosting
├── manifest.json                 # Konfigurasi Manifest V3 Chrome
├── background.js                 # Service worker latar belakang + Remote Sync
├── icons/                        # Ikon HD ekstensi
├── options/                      # Tampilan Pengaturan Ekstensi
├── popup/                        # Tampilan Popup Ekstensi
└── html/                         # Alias options.html
```

---

## 🌐 Endpoint API

| Endpoint | Metode | Deskripsi |
| :--- | :--- | :--- |
| `/` atau `/?route=admin` | GET | Tampilan Dashboard Admin MVC |
| `/?route=admin/save` | POST | Menyimpan perubahan konfigurasi dari admin |
| `/?route=admin/force-wipe` | GET | Memicu perintah remote wipe seketika |
| `/?route=admin/download-zip` | GET | Mengunduh berkas `.zip` ekstensi terbaru |
| `/api/config` atau `/?route=api/config` | GET | REST API JSON untuk sinkronisasi otomatis ekstensi |
| `/updates.xml` atau `/?route=updates.xml` | GET | File XML protokol update otomatis Chrome |

---

## 🚀 Panduan Pemasangan & Penggunaan

### A. Uji Coba Lokal di Komputer Anda (XAMPP):
1. **Buka Dashboard Admin:**
   Buka browser dan akses:  
   👉 **`http://localhost/chace/`**
2. **Pasang Ekstensi di Chrome:**
   - Buka `chrome://extensions/`
   - Aktifkan **Developer mode** di pojok kanan atas.
   - Klik **Load unpacked**, lalu pilih folder: `C:\xampp\htdocs\chace`
3. Coba ubah pengaturan di Dashboard Admin (misal: ubah interval menit atau centang data), lalu simpan. Ekstensi akan otomatis mengambil pembaruan tersebut!

### B. Deployment ke Hosting Server Anda:
1. Unggah seluruh isi folder `C:\xampp\htdocs\chace` ke direktori root hosting / domain Anda (biasanya `public_html` atau sesuai konfigurasi subdomain Anda).
2. Pastikan file `.htaccess` terunggah dan module Apache `mod_rewrite` aktif.
3. Dashboard admin dapat langsung diakses di domain hosting Anda (contoh: `https://domain-anda.com/`).
4. Masukkan URL domain hosting Anda pada kolom **Domain Server Sinkronisasi** di Dashboard Admin dan simpan. Ekstensi client akan otomatis terhubung ke domain tersebut.

---

## 📄 Hak Cipta & Kontak Pengembang

- **Nama Ekstensi:** Auto History Wipe
- **Pengembang / Kontak:** [cs.baguosps@gmail.com](mailto:cs.baguosps@gmail.com)
- **Copyright:** &copy; 2026 cs.baguosps@gmail.com. All rights reserved.
