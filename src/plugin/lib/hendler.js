export const funcHandler = async (txt, s, c, m, prefix, sp = null, errCondition, errMessage, exct) => {
  try {
    // Pastikan prefix cocok
    if (!txt.startsWith(prefix)) return;

    // Ambil teks setelah prefix
    const content = txt.slice(prefix.length).trim();

    // Jika ada separator (sp), pecah jadi array
    const args = sp ? content.split(sp).map(a => a.trim()) : [content];

    // Cek kondisi error (misalnya arg kosong)
    if (!errCondition || (Array.isArray(errCondition) && errCondition.length === 0)) {
      if (errMessage) {
        await s.sendMessage(c, { text: errMessage }, { quoted: m });
      }
      return;
    }

    // Pastikan `exct` adalah fungsi, kirim argumen ke dalamnya
    if (typeof exct === "function") {
      await exct(args, s, c, m);
    } else {
      console.warn("⚠️ exct bukan fungsi yang valid");
    }

  } catch (error) {
    console.error("Error di funcHandler:", error);
    await s.sendMessage(c, { text: `❌ Terjadi kesalahan: ${error.message}` }, { quoted: m });
  }
};
