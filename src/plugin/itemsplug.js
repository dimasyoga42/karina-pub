import * as cheerio from "cheerio"
export const getItems = async (sock, chatId, msg, name) => {
  try {
    const url = `https://coryn.club/item.php?name=${encodeURIComponent(name)}`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const items = [];
    $("div.card-container > div").each((index, element) => {
      const $element = $(element);

      if ($element.hasClass('card-adsense')) return;

      const itemName = $element.find("div.card-title").first().text().trim();
      if (!itemName) return;

      const sellElement = $element.find(".item-prop p:contains('Sell')").next();
      const processElement = $element.find(".item-prop p:contains('Process')").next();

      const sell = sellElement.length ? sellElement.text().trim() : 'Unknown';
      const process = processElement.length ? processElement.text().trim() : 'Unknown';

      const stats = [];
      $element.find("div.table-grid.item-basestat > div").slice(1).each((i, row) => {
        const $row = $(row);
        const stat = $row.find("div").eq(0).text().trim();
        const amount = $row.find("div").eq(1).text().trim();
        if (stat && amount) {
          stats.push(`${stat}: ${amount}`);
        }
      });

      const obtainedFrom = [];
      $element.find("div.table-grid.no-head.item-obtainfrom.pagination-js-items .pagination-js-item").each((i, row) => {
        const $row = $(row);
        const monster = $row.find("div").eq(0).text().trim().replace(/\s+/g, ' ');
        const map = $row.find("div").eq(2).text().trim().replace(/\s+/g, ' ');

        if (monster || map) {
          let source = monster || 'Unknown Monster';
          if (map && map !== '-') {
            source += ` [${map}]`;
          }
          obtainedFrom.push(source);
        }
      });

      const recipes = [];
      $element.find("li:contains('Recipe')").each((i, recipeElement) => {
        const $recipe = $(recipeElement);
        const fee = $recipe.find("p:contains('Fee')").next().text().trim();
        const level = $recipe.find("p:contains('Level')").next().text().trim();
        const difficulty = $recipe.find("p:contains('Difficulty')").next().text().trim();

        const materials = [];
        $recipe.find("ul li").each((j, mat) => {
          const material = $(mat).text().trim().replace(/^-\s*/, '').replace(/\s+/g, ' ');
          if (material) materials.push(material);
        });

        if (fee || materials.length) {
          let recipeInfo = 'Recipe:\n';
          if (fee) recipeInfo += `  Fee: ${fee}\n`;
          if (level && level !== 'N/A') recipeInfo += `  Level: ${level}\n`;
          if (difficulty && difficulty !== '0') recipeInfo += `  Difficulty: ${difficulty}\n`;
          if (materials.length) {
            recipeInfo += `  Materials:\n`;
            materials.forEach(mat => recipeInfo += `    - ${mat}\n`);
          }
          recipes.push(recipeInfo.trim());
        }
      });

      items.push({
        name: itemName,
        sell,
        process,
        stats,
        obtainedFrom,
        recipes
      });
    });

    if (items.length === 0) {
      await sock.sendMessage(chatId, {
        text: `No items found for "${name}". Please check the spelling or try a different search term.`
      }, { quoted: msg });
      return;
    }

    let message = `TORAM ONLINE - ITEM SEARCH\n`;
    message += `Query: "${name}" | Results: ${items.length} item(s)\n`;
    message += `${'━━━━━━━━━━━━━━━━━'}\n\n`;

    items.forEach((item, index) => {
      message += `[${index + 1}] ${item.name}\n`;
      message += `    Sell: ${item.sell} | Process: ${item.process}\n`;

      if (item.stats.length > 0) {
        message += `    Stats:\n`;
        item.stats.forEach(stat => message += `      - ${stat}\n`);
      }

      if (item.obtainedFrom.length > 0) {
        message += `    Source:\n`;
        const sources = item.obtainedFrom.slice(0, 3);
        sources.forEach(source => message += `      - ${source}\n`);
        if (item.obtainedFrom.length > 3) {
          message += `      ... +${item.obtainedFrom.length - 3} more\n`;
        }
      }

      if (item.recipes.length > 0) {
        message += `    ${item.recipes.join('\n')}\n`;
      }

      if (index < items.length - 1) {
       message += `\n${'━━━━━━━━━━━━━━━━━'}\n\n`;
      }
    });

    message += `${'━━━━━━━━━━━━━━━━━'}`;

    await sock.sendMessage(chatId, { text: message }, { quoted: msg });

  } catch (error) {
    console.error('Error in getItems:', error);
    await errMessage(sock, chatId, msg, error);
  }
};
