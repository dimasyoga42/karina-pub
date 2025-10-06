import fetch from "node-fetch";

const database = [];

const find = async (query) => {
  try {
    const response = await fetch(`http://toramonline.vercel.app/xtall/name/${query}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const res = await response.data;;

    // Validasi data sebelum push
    if (res && res.name) {
      const newdata = {
        name: res.name,
        type: res.type,
        upgrade: res.upgrade,
        stat: res.stat
      };
      database.push(newdata);
      console.log(res.data);
      return newdata;

    } else {
      throw new Error('Data tidak ditemukan');
    }
  } catch (error) {
    throw error;
  }
};

export const searchXtall = async (sock, chatId, msg, arg) => {
  try {
    // Ekstrak query dari pesan (misalnya setelah command)
    const query = arg.trim();

    if (!query) {
      await sock.sendMessage(chatId, { text: 'Silakan masukkan nama Xtall yang ingin dicari!' });
      return;
    }

    // Cari data
    const result = await find(query);

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
