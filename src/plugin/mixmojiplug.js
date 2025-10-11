import sharp from "sharp";

const STICKER_SIZE = 512;
const WEBP_QUALITY = 80;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const Mix = async (sock, chatId, msg, argone, argtwo) => {
  try {
    const mixmoji1 = argone
    const mixmoji2 = argtwo
    // Request ke Tenor API
    const response = await fetch(
      `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(mixmoji1)}_${encodeURIComponent(mixmoji2)}`
    );

    if (!response.ok) throw new Error(await response.text());

    const data = await response.json();
    console.log({data});

    // Cek apakah ada results


    // Ambil URL gambar
    const imageUrl = data.results[0]?.url;

    if (!imageUrl) {
      throw new Error('URL gambar tidak ditemukan');
    }

    // Download gambar dari URL
    const imageResponse = await fetch(imageUrl);
    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageUrl);

    // Konversi ke sticker
    const sticker = await sharp(buffer)
      .resize(STICKER_SIZE, STICKER_SIZE, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();

    await sock.sendMessage(chatId, {
      sticker: sticker,
      mimetype: "image/webp"
    }, { quoted: msg });

  } catch (err) {
    console.error('Error in Mix:', err);
    await sock.sendMessage(chatId, {
      text: `❌ Error: ${err.message || 'Gagal membuat emoji mix'}`
    }, { quoted: msg });
  }
}
