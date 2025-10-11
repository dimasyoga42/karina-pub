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
    const imageUrl =
      data.results?.[0]?.media_formats?.png_transparent?.url ||
      data.results?.[0]?.url;

    if (!imageUrl) {
      await sock.sendMessage(chatId, {
        text: "❌ Kombinasi emoji tidak ditemukan atau tidak didukung 😔",
      }, { quoted: msg });
      return;
    }

    // Unduh gambar
    const imgRes = await fetch(imageUrl);
    const arrBuf = await imgRes.arrayBuffer();
    const buffer = Buffer.from(arrBuf);

    // Konversi ke webp sticker
    const sticker = await sharp(buffer)
      .resize(STICKER_SIZE, STICKER_SIZE, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    await sock.sendMessage(
      chatId,
      { sticker },
      { quoted: msg }
    );
  } catch (err) {
    console.error("Mix error:", err);
    await sock.sendMessage(chatId, {
      text: `❌ Gagal membuat emoji mix: ${err.message}`,
    }, { quoted: msg });
  }
};
