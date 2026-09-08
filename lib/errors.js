function friendlyFirebaseError(errStr) {
  if (!errStr || typeof errStr !== 'string') return 'Terjadi kesalahan autentikasi.';
  if (errStr.includes('INVALID_OOB_CODE')) return 'Kode magic link tidak valid atau sudah pernah digunakan.';
  if (errStr.includes('EXPIRED_OOB_CODE')) return 'Magic link telah kadaluarsa. Kirim ulang tautan baru.';
  if (errStr.includes('INVALID_EMAIL')) return 'Format email tidak valid.';
  if (errStr.includes('EMAIL_NOT_FOUND')) return 'Email tidak ditemukan. Kirim magic link terlebih dahulu.';
  if (errStr.includes('USER_DISABLED')) return 'Akun dinonaktifkan oleh admin.';
  if (errStr.includes('TOO_MANY_ATTEMPTS_TRY_LATER')) return 'Terlalu banyak percobaan. Coba lagi nanti.';
  if (errStr.includes('API_KEY_INVALID') || errStr.includes('API key not valid')) return 'FIREBASE_API_KEY tidak valid.';
  if (errStr.includes('Gagal mengekstrak oobCode')) return 'Format magic link tidak dikenali. Pastikan menempel seluruh URL dari email.';
  return errStr.length > 500 ? errStr.slice(0, 500) : errStr;
}

module.exports = {
  friendlyFirebaseError
};
