export const funcHandler = async (txt, s, c, m, prefix, err, errMessage, exct) => {
  try {
    if (txt.startsWith(prefix)) {
      if (!err) {
        await s.sendMessage(c, { text: errMessage }, { quoted: m });
        return;
      }

      if (typeof exct === "function") {
        await exct();
      } else {
        console.warn("⚠️ exct bukan fungsi yang valid");
      }
    }
  } catch (error) {
    console.error("Error di funcHandler:", error);
    await s.sendMessage(c, { text: `❌ Terjadi kesalahan: ${error.message}` }, { quoted: m });
  }
};

