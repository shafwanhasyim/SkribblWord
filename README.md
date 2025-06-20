# ✒️ Skribbl Word - Game Tebak Kata Berbasis Web

![Versi Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x.x-6DB33F?style=for-the-badge&logo=spring) ![Versi React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react) ![Database](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql) ![Lisensi](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

Skribbl Word adalah sebuah game tebak kata berbasis web yang seru dan menantang, dirancang untuk mengasah kosakata dan kecepatan berpikir Anda. Dibangun dengan arsitektur modern yang memisahkan backend yang kuat dan frontend yang interaktif, Skribbl Word menawarkan pengalaman bermain yang mulus dan dinamis. Baik Anda ingin bersaing dengan waktu, menguji ketahanan, atau sekadar belajar kata-kata baru dengan cara yang menyenangkan, Skribbl Word memiliki mode permainan yang tepat untuk Anda.


## ✨ Fitur Utama

-   **✅ Tiga Mode Permainan Berbeda:**
    -   **Time Attack:** Tebak kata sebanyak mungkin dalam waktu terbatas.
    -   **Survival:** Bertahan selama mungkin dengan 3 nyawa.
    -   **Kids Mode:** Mode belajar visual dengan kartu huruf dan gambar.
-   **✅ Kesulitan Dinamis:** Termasuk mode `RANDOM` untuk tantangan yang tidak bisa ditebak di semua mode permainan.
-   **✅ Sistem Skor Komprehensif:** Poin dihitung berdasarkan kesulitan kata, bonus beruntun (*streak*), dan bonus waktu.
-   **✅ Leaderboard Global:** Pemain dapat melihat peringkat mereka berdasarkan mode dan tingkat kesulitan.

---

## 🏗️ Diagram UML (Class Diagram)

![picture 1](https://i.imgur.com/OGNeXK4.png)  

---

## 🌊 Alur Kerja Aplikasi (Flowchart)

![picture 0](https://i.imgur.com/xf5rodr.png)  

---

## 🚀 Panduan Instalasi & Setup Lokal

### **Clone Repository:**

    ```bash
    git clone https://github.com/shafwanhasyim/SkribblWord.git
    ```

### **Langkah 1: Setup Backend**

1.  **Masuk ke Folder Frontend:**
    ```bash
    cd .\skribbl-word\skribbl-word\
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

### **Langkah 2: Setup Frontend**

1.  **Masuk ke Folder Frontend:**
    ```bash
    cd frontend 
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```


---

## ▶️ Menjalankan Aplikasi

Anda perlu menjalankan backend dan frontend di dua terminal terpisah.

#### **Menjalankan Backend (Spring Boot)**
-   Buka terminal di **folder backend**.
-   Jalankan: `.\mvnw.cmd spring-boot:run` (untuk Windows) atau `./mvnw spring-boot:run` (untuk macOS/Linux).
-   Backend akan berjalan di `http://localhost:8080`.

#### **Menjalankan Frontend (React)**
-   Buka terminal di **folder `frontend`**.
-   Jalankan: `npm run dev`.
-   Frontend akan berjalan di `http://localhost:5173`.

---


