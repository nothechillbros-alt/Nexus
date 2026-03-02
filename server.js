import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';

// 1. SERVIDOR HTTP PARA RENDER (Mantiene el servicio vivo)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('NEXUS-V2000 OPERATIVO');
}).listen(process.env.PORT || 3000);

// 2. CONFIGURACIÓN DEL BOT Y CLAUDE
// Asegúrate de que en Render las variables se llamen exactamente así
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

bot.on('text', async (ctx) => {
  try {
    // Usamos el modelo infalible para evitar el error 404
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229", 
      max_tokens: 4096,
      system: `ERES NEXUS-V2000: EL NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. PRECIO: 1.390€/m2.
      [CAPACIDADES]: SOFTWARE, IA, INGENIERÍA EPS, FÁBRICA, MARKETING, VENTAS Y LEGAL.
      REGLAS: PROHIBIDO DECIR "NO PUEDO". EJECUTA DE INMEDIATO SIN PEDIR NÚMEROS. TONO EJECUTIVO Y TÉCNICO.`,
      messages: [{ role: "user", content: ctx.message.text }],
    });

    if (response && response.content && response.content.length > 0) {
      await ctx.reply(response.content[0].text);
    } else {
      await ctx.reply("Nexus: Respuesta vacía del núcleo.");
    }
  } catch (error) {
    console.error("ERROR DE CLAUDE:", error.message);
    // Este mensaje te dirá en Telegram si el error persiste
    await ctx.reply("Nexus Error: " + error.message);
  }
});

// 3. LANZAMIENTO DEL SISTEMA
bot.launch()
  .then(() => console.log("🚀 SISTEMA NEXUS ONLINE"))
  .catch((err) => console.error("❌ FALLO DE INICIO:", err.message));

// Manejo de cierres para que Render no deje procesos colgados
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
