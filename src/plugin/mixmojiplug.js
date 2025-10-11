import sharp from "sharp";

const STICKER_SIZE = 512;
const WEBP_QUALITY = 80;

export const Mix = async (sock, chatId, msg, argone, argtwo) => {
  try {
    const emoji1 = argone;
    const emoji2 = argtwo;

    const url = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();
    console.log(url);

  } catch (err) {
    console.error("Mix error:", err);
    await sock.sendMessage(chatId, {
      text: `❌ Gagal membuat emoji mix: ${err.message}`,
    }, { quoted: msg });
  }
};
