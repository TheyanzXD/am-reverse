<div align="center">

# ⚡ AlightMotion Premium Activate

**unofficial alight motion premium activator**

*reverse engineered — cli & web, no ads, no tracking*

**live:** [am.neonode.my.id](https://am.neonode.my.id)

<img src="https://img.shields.io/badge/status-unofficial-orange" alt="">
<img src="https://img.shields.io/badge/reverse--engineering-deep-red" alt="">
<img src="https://img.shields.io/badge/node-18%2B-green" alt="">

**team reverse — neo:** ansari • zenno

</div>

> ⚠️ **UNOFFICIAL — bukan alat resmi dari Alight Creative.**
> Dibuat murni dari **reverse engineering mendalam** terhadap aplikasi Android Alight Motion: di-snip trafiknya, dibedah protokol Firebase Auth & endpoint `verifyPurchase`-nya, lalu di-reimplement jadi CLI + web. Kalau kelakuanmu kena ban, tanggung sendiri.

---

## apa yang bisa dilakuin

- **magic link login** — masuk pake email doang, tanpa password, tanpa akun google
- **premium aktif otomatis** — langsung nempel ke akun setelah verifikasi
- **auto refresh token** — aktivasi ulang kapan aja dari sesi tersimpan
- **dual mode** — CLI buat yang mager, web UI buat yang mau tampilan
- **stealth headers** — nyamar 100% sebagai app android asli (`x-android-package` + `x-android-cert`)

## cara pakai

### cli
```
node am.js
```
| | |
|---|---|
| `1` | kirim magic link ke email |
| `2` | paste link dari email → premium aktif |
| `3` | aktivasi ulang dari sesi tersimpan |
| `4` | lihat sesi tersimpan |

### web
```bash
npm install
node server.js
```
buka `http://localhost:3300` — ikuti 3 langkah di layar.

---

<div align="center">

**disclaimer** — ini riset independen. tidak berafiliasi dengan alight creative / google.
semua merek dagang milik pemiliknya masing-masing. gunakan atas risiko sendiri.
penyalahgunaan (akun orang lain, massal, komersial) bukan tanggung jawab pembuat.

</div>
