export const funcHandler = async (txt, s, c, m, prefix, sp = null, errCondition, errMessage, exct) => {
  try {
    if (!txt.startsWith(prefix)) return;

    const content = txt.slice(prefix.length).trim();

    const args = sp ? content.split(sp).map(a => a.trim()) : [content];

    if (!errCondition || (Array.isArray(errCondition) && errCondition.length === 0)) {
      if (errMessage) {
        await s.sendMessage(c, { text: errMessage }, { quoted: m });
      }
      return;
    }

    if (typeof exct === "function") {
      await exct( s, c, m, args);
    } else {
      console.warn("⚠️ exct bukan fungsi yang valid");
    }

  } catch (error) {
    console.error("Error di funcHandler:", error);
    await s.sendMessage(c, { text: `❌ Terjadi kesalahan: ${error.message}` }, { quoted: m });
  }
};
