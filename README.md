# Study Planner TKA — To-Do List SMA Kelas 12

Aplikasi To-Do List / Study Planner untuk persiapan **Tes Kemampuan Akademik (TKA) SMA Kelas 12**
dengan target belajar **30 hari**. Dibuat dengan **Next.js (App Router)** + **Tailwind CSS**,
seluruh logika berada dalam satu komponen di `app/page.tsx`.

## Fitur

- **Data kisi-kisi TKA** untuk 5 mata pelajaran (Matematika Wajib, Bahasa Indonesia,
  Bahasa Inggris Wajib, Matematika Tingkat Lanjut, Bahasa Inggris Tingkat Lanjut).
- **Checkbox Selesai/Belum** pada setiap sub-materi.
- **Progress bar** total dan per mata pelajaran (persentase otomatis).
- **Countdown timer** 30 hari (hari/jam/menit/detik) + bar waktu terpakai.
- **Target harian rekomendasi** yang dihitung dari sisa sub-materi dan sisa hari.
- **Filter tabs** per mata pelajaran + pencarian sub-materi.
- **Penyimpanan LocalStorage** — checklist tidak hilang saat halaman di-refresh.
- Responsif untuk mobile, tablet, dan desktop.

## Setup Project dari Awal

Prasyarat: **Node.js 18.18+** (disarankan 20+) dan npm.

### 1. Buat project Next.js baru

```bash
npx create-next-app@latest my-todolist --ts --tailwind --eslint --app --no-src-dir --import-alias "@/*"
cd my-todolist
```

> Catatan: nama folder project **tidak boleh mengandung huruf kapital** (aturan penamaan npm).
> Jika folder sudah ada (mis. `TO_DO_List`), jalankan `create-next-app` di folder sementara
> lalu pindahkan isinya ke folder tujuan.

### 2. Salin file aplikasi

Ganti isi `app/page.tsx` dengan kode dari repositori ini. Opsional, sesuaikan
`app/layout.tsx` (bahasa `id` + metadata).

### 3. Jalankan mode development

```bash
npm run dev
```

Buka <http://localhost:3000>.

### 4. Build produksi (opsional)

```bash
npm run build
npm run start
```

## Struktur File

```
app/
  page.tsx      # Seluruh aplikasi (data, state, UI)
  layout.tsx    # Root layout + metadata
  globals.css   # Tailwind + variabel tema
```

## Penyimpanan Data

| Key LocalStorage              | Isi                                        |
| ----------------------------- | ------------------------------------------ |
| `tka-planner:progress:v1`     | Objek `{ [subtopikId]: true }`             |
| `tka-planner:start-date:v1`   | Timestamp (ms) awal mulai hitungan 30 hari |

Tombol **Reset Semua Checklist** menghapus progres, sedangkan
**Mulai ulang hitungan 30 hari dari hari ini** mengatur ulang tanggal mulai.

