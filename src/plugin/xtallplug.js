import fetch from "node-fetch";

export const searchXtall = async (sock, chatId, msg, arg) => {
  try {
    // Ekstrak query dari pesan (misalnya setelah command)
    const query = arg.trim();
    const response = await fetch(`http://toramonline.vercel.app/xtall/name/${query}`);
    const res = await response.data;;

    if (!query) {
      await sock.sendMessage(chatId, { text: 'Silakan masukkan nama Xtall yang ingin dicari!' });
      return;
    }

    // Cari data
    const result = await res.data;

    // Format response
    const responseText = `
 *Xtall Information*
 Name: ${result.name}
 Type: ${result.type}
 Upgrade: ${result.upgrade}
 Stat: ${result.stat}
    `.trim();

    await sock.sendMessage(chatId, { text: responseText });

  } catch (error) {
    console.error('Error in searchXtall:', error);
    await sock.sendMessage(chatId, {
      text: `Terjadi kesalahan: ${error.message || 'Tidak dapat menemukan data Xtall'}`
    });
  }
};
