import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';
import fs from 'fs';

http.createServer((req, res) => { res.end('NEXUS ACTIVE'); }).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229", // Usa este nombre de modelo estándar para asegurar compatibilidad
      max_tokens: 4096,
      messages: [{ role: "user", content: ctx.message.text }],
    });

    const text = response.content[0].text;
    const fileName = `NEXUS_${Date.now()}.html`;
    
    // Extraemos el código si existe, si no, guardamos todo el texto
    const code = text.includes('```html') ? text.split('```html')[1].split('```')[0] : text;
    
    fs.writeFileSync(fileName, code.trim());
    await ctx.replyWithDocument({ source: fileName });
    fs.unlinkSync(fileName);
  } catch (e) {
    await ctx.reply("Error: " + e.message);
  }
});
bot.launch();
