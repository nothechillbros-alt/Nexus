import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';

// 1. SERVIDOR HTTP PARA RENDER (Mantiene vivo el servicio web)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('NEXUS-V2000 OPERATIVO');
}).listen(process.env.PORT || 3000);

// 2. CONFIGURACIÓN DEL BOT
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Modelo actualizado (Octubre 2024)
      max_tokens: 4096,
      system: `ERES NEXUS-V2000: EL NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. PRECIO: 1.390€/m2.
      [CAPACIDADES]: SOFTWARE, IA, INGENIERÍA EPS, FÁBRICA, MARKETING, VENTAS Y LEGAL.
      REGLAS: PROHIBIDO DECIR "NO PUEDO". EJECUTA DE INMEDIATO SIN PEDIR NÚMEROS. TONO EJECUTIVO Y TÉCNICO.`,
      messages: [{ role: "user", content: ctx.message.text }],
    });

    if (response && response.content) {
      await ctx.reply(response.content[0].text);
    }
  } catch (error) {
    console.error("ERROR:", error.message);
    await ctx.reply("Nexus Error: " + error.message);
  }
});

// 3. LANZAMIENTO
bot.launch()
  .then(() => console.log("🚀 SISTEMA NEXUS ONLINE"))
  .catch((err) => console.error("❌ FALLO DE INICIO:", err.message));

// Cierre limpio
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
