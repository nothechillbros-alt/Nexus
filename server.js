import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';

// Esto mantiene vivo el servicio web en Render
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('NEXUS-V2000 OPERATIVO');
}).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620", 
      max_tokens: 4096,
      system: "ERES NEXUS-V2000: NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. PRECIO: 1.390€/m2. REGLAS: PROHIBIDO DECIR 'NO PUEDO'.",
      messages: [{ role: "user", content: ctx.message.text }],
    });
    await ctx.reply(response.content[0].text);
  } catch (error) {
    console.error(error);
    await ctx.reply("Nexus Error: " + error.message);
  }
});

bot.launch().then(() => console.log("🚀 BOT LISTO"));
