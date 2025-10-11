export const funcHandler = async (txt, s, c, m, prefix, sp = " ", errMessage, exct) => {
  try {
    // Jika pesan tidak dimulai dengan prefix, abaikan
    if (!txt.startsWith(prefix)) return;

    // Ambil argumen dari teks setelah prefix
    const args = txt.slice(prefix.length).trim().split(sp).filter(a => a);

    // Jika tidak ada argumen dan errorMessage diset, kirim pesan error
    if (args.length === 0 && errMessage) {
      await s.sendMessage(c, { text: errMessage }, { quoted: m });
      return;
    }

    // Jika `exct` adalah fungsi, eksekusi dengan argumen dinamis
    if (typeof exct === "function") {
      await exct(...args);
    } else {
      console.warn("⚠️ exct bukan fungsi yang valid");
    }

  } catch (error) {
    console.error("Error di funcHandler:", error);
    await s.sendMessage(
      c,
      { text: `❌ Terjadi kesalahan: ${error.message}` },
      { quoted: m }
    );
  }
};
