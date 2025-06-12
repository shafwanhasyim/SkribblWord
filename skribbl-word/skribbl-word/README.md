Halo Copilot,

Kita akan memulai pengembangan backend untuk sebuah proyek game web bernama **"Skribbl Word"**. Dokumen ini adalah briefing lengkap mengenai arsitektur, teknologi, dan spesifikasi yang akan kita gunakan. Mohon gunakan konteks ini untuk semua saran kode yang kamu berikan.

**1. Gambaran Umum Proyek**

Tujuan kita adalah membangun **REST API** menggunakan Spring Boot yang akan menjadi otak dari game "Skribbl Word". Game ini memiliki beberapa mode:
* **Mode Anak:** Menebak kata berdasarkan gambar dengan mengklik kartu huruf.
* **Mode Time Attack:** Mencetak skor setinggi-tingginya dalam waktu terbatas.
* **Mode Survival:** Bertahan selama mungkin dengan 3 nyawa.

API ini akan menangani semua logika game, manajemen pengguna, dan data leaderboard.

**2. Teknologi Utama yang Digunakan**

* **Backend Framework:** Spring Boot 3.x
* **Bahasa:** Java 17 (atau 21)
* **Build Tool:** Maven
* **Database:** PostgreSQL (dihosting di NeonDB)
* **Akses Data:** Spring Data JPA (Hibernate)
* **Keamanan:** Spring Security
* **Otentikasi:** JWT (JSON Web Tokens) yang disimpan dalam **HttpOnly Cookies**.
* **Penyimpanan Gambar:** Cloudinary
* **Library Tambahan:** Lombok, JJWT (untuk JWT), Cloudinary SDK.

**3. Prinsip Arsitektur Fundamental**

* **Backend sebagai Sumber Kebenaran (Source of Truth):** SEMUA logika game (pengacakan kata, validasi jawaban, perhitungan skor) dan validasi keamanan HARUS terjadi di backend untuk mencegah kecurangan. Frontend hanya menampilkan data dan mengirim aksi pengguna.
* **Layered Architecture:** Kita akan mengikuti struktur lapisan standar: `Controller` -> `Service` -> `Repository` -> `Model/Entity`.
* **Stateless REST API:** Setiap request dari klien harus berisi semua informasi yang dibutuhkan untuk diproses (biasanya melalui token JWT di cookie).

**4. Skema Database (PostgreSQL)**

Kita akan menggunakan **UUID** sebagai Primary Key untuk semua tabel.

* **Tabel `users`:**
    * `id` (UUID, PK)
    * `username` (VARCHAR, Unique)
    * `email` (VARCHAR, Unique)
    * `password_hash` (VARCHAR) -> Akan di-hash menggunakan **BCrypt**.
    * `role` (ENUM: `ROLE_USER`, `ROLE_ADMIN`)

* **Tabel `words`:**
    * `id` (UUID, PK)
    * `word` (VARCHAR)
    * `category` (VARCHAR)
    * `difficulty` (ENUM: `EASY`, `MEDIUM`, `HARD`)
    * `image_url` (TEXT) -> Akan berisi URL penuh dari Cloudinary.

* **Tabel `game_scores`:**
    * `id` (UUID, PK)
    * `user_id` (UUID, FK ke `users.id`)
    * `game_mode` (ENUM: `TIME_ATTACK`, `SURVIVAL`)
    * `difficulty` (ENUM)
    * `score` (INTEGER)
    * `survival_time_seconds` (INTEGER)
    * `played_at` (TIMESTAMPTZ)

**5. Spesifikasi Logika Inti**

* **Pengacakan Kata:** Harus dilakukan di backend secara dinamis (`Collections.shuffle`) dan memastikan hasil acakan tidak sama dengan kata aslinya.
* **Upload Gambar Admin:** Menggunakan alur **"Signed Upload"**. Backend tidak menerima file, hanya menyediakan endpoint `GET /api/admin/upload-signature` yang aman. Frontend akan menggunakan signature ini untuk meng-upload file langsung ke Cloudinary.
* **Sistem Skor:** Logika skor (termasuk bonus beruntun/streak) dihitung dan dikelola di memori server selama sesi game berlangsung dan hanya disimpan ke database di akhir permainan.
