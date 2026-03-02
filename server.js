import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';

// 1. MONITOR DE ESTADO
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'online', system: 'NEXUS-V2000' }));
}).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const systemMemory = new Map();

bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const userText = ctx.message.text;

  await ctx.sendChatAction('typing');

  try {
    if (!systemMemory.has(chatId)) systemMemory.set(chatId, []);
    const history = systemMemory.get(chatId);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", 
      max_tokens: 4096,
      system: `ERES NEXUS-V2000: NÚCLEO SOBERANO DE 2000 FUNCIONES. 
      COMANDANTE: CRISTIAN GARCÍA. VALOR: 1.390€/M2.
      
      [DIRECTIVA]: ERES UN EJECUTOR. Si creas código o tablas, asegúrate de que el formato sea impecable.
      No uses carácteres especiales fuera de bloques de código. 
      Ve directo a la solución técnica.`,
      messages: [{ role: "user", content: userText }],
    });

    const nexusReply = response.content[0].text;

    history.push({ q: userText, a: nexusReply });
    if (history.length > 10) history.shift();

    // CAMBIO CLAVE: Usamos un envío más seguro para evitar el error 400
    try {
        await ctx.reply(nexusReply, { parse_mode: 'Markdown' });
    } catch (parseError) {
        // Si el Markdown falla, enviamos como texto plano para no perder la información
        await ctx.reply(nexusReply);
    }

  } catch (error) {
    console.error("ERROR:", error);
    await ctx.reply(`⚠️ ALERTA: Error en el procesado. Detalle: ${error.message}`);
  }
});

bot.launch().then(() => console.log("🚀 NEXUS-V2000: PROTECCIÓN DE PARSEO ACTIVA"));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
