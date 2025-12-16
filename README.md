# BongkarDev

DevTools berbasis web untuk menginspeksi dan men-debug browser Chromium melalui Chrome DevTools Protocol (CDP). Frontend dan backend dipisah ketat: frontend Next.js (App Router) berbicara ke backend proxy WebSocket, backend meneruskan perintah ke Chrome/Chromium via CDP.

## Struktur
- `backend/`: Proxy CDP (Express + WebSocket) yang membuka endpoint HTTP `/json` dan kanal WebSocket `/ws` untuk meneruskan pesan CDP.
- `frontend/`: Next.js App Router + TypeScript + Tailwind + Zustand + next-intl. UI dasar: header, sidebar target selector, dan panel utama.

## Backend
- Menyediakan `/json` untuk mengambil daftar target langsung dari Chrome/Chromium yang dijalankan dengan `--remote-debugging-port=9222` (alamat dapat diubah via `CDP_BASE`).
- WebSocket server (`/ws`) mem-proxy pesan: frontend mengirim `connect` + `targetId`, backend membuka WebSocket ke CDP dan meneruskan event/pesan.
- Konfigurasi:
  - `PORT` (default 4000)
  - `CDP_BASE` (default `http://127.0.0.1:9222`)

Menjalankan backend:
```bash
cd backend
npm install
npm run dev
```

## Frontend
- App Router dengan i18n (Bahasa Indonesia default, English tambahan) memakai `next-intl`.
- Tailwind dikustom dengan radius konsisten 20px untuk header, sidebar, panel, dan tombol (dark mode default).
- Zustand menyimpan status koneksi dan daftar target dari backend; koneksi selalu melalui WebSocket proxy.

Menjalankan frontend:
```bash
cd frontend
npm install
npm run dev
```

Frontend mengharapkan backend hidup di `http://localhost:4000` / `ws://localhost:4000/ws` (bisa diubah lewat `NEXT_PUBLIC_PROXY_HTTP` dan `NEXT_PUBLIC_PROXY_WS`).
