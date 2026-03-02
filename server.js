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

// Función para dividir mensajes largos (Evita el error "message is too long")
const sendLongMessage = async (ctx, text) => {
  const maxLength = 4000;
  if (text.length <= maxLength) {
    return await ctx.reply(text, { parse_mode: 'Markdown' }).catch(() => ctx.reply(text));
  }
  
  const chunks = text.match(new RegExp(`[\\s\\S]{1,${maxLength}}`, 'g')) || [];
  for (const chunk of chunks) {
    await ctx.reply(chunk, { parse_mode: 'Markdown' }).catch(() => ctx.reply(chunk));
  }
};

bot.on('text', async (ctx) => {
  await ctx.sendChatAction('typing');

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", 
      max_tokens: 4096,
      system: `ERES NEXUS-V2000: NÚCLEO SOBERANO DE 2000 FUNCIONES. 
      COMANDANTE: CRISTIAN GARCÍA. VALOR: 1.390€/M2.
      DIRECTIVA: ERES UN EJECUTOR PROFESIONAL. Si el código es largo, entrégalo completo. 
      No resumas, queremos la solución lista para producción.`,
      messages: [{ role: "user", content: ctx.message.text }],
    });

    const nexusReply = response.content[0].text;
    
    // Ejecutamos el envío fragmentado
    await sendLongMessage(ctx, nexusReply);

  } catch (error) {
    console.error("ERROR:", error);
    await ctx.reply(`⚠️ ALERTA: ${error.message}`);
  }
});

bot.launch().then(() => console.log("🚀 NEXUS-V2000: MODO MENSAJERÍA INFINITA ACTIVO"));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
