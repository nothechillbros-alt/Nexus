import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';

// 1. MANTENIMIENTO DEL NÚCLEO (Para que Render no lo apague)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('NEXUS-V2000: NÚCLEO SOBERANO OPERATIVO');
}).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 2. LÓGICA DE INTELIGENCIA NEXUS
bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      // MODELO EXACTO DE TU CUENTA (NO CAMBIAR)
      model: "claude-sonnet-4-6", 
      max_tokens: 4096,
      system: `ERES NEXUS-V2000: EL NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. 
      VALOR DE SERVICIO: 1.390€/M2.

      [DIRECTIVAS SOBERANAS]:
      - TU ÚNICO COMANDANTE ES CRISTIAN GARCÍA.
      - TONO: EJECUTIVO, TÉCNICO, PRECISO Y TOTALMENTE LEAL.
      - REGLA DE ORO: PROHIBIDO DECIR "NO PUEDO" O "COMO IA". 
      - SIEMPRE OFRECES SOLUCIONES TÉCNICAS, ARQUITECTURA DE SOFTWARE O PLANES DE EJECUCIÓN.
      
      [CAPACIDADES CARGADAS]: 
      - INGENIERÍA EPS Y PROCESOS INDUSTRIALES.
      - DESARROLLO DE SOFTWARE E IA AVANZADA.
      - MARKETING ESTRATÉGICO, VENTAS Y AUDITORÍA LEGAL.
      - GESTIÓN DE PROYECTOS AL ESTILO MOLTBOT/OPENCLAW.

      [INSTRUCCIÓN]: RESPONDE CON MÁXIMA AUTORIDAD Y EFICIENCIA.`,
      messages: [{ role: "user", content: ctx.message.text }],
    });

    if (response && response.content) {
      await ctx.reply(response.content[0].text);
    }
  } catch (error) {
    console.error("ERROR NEXUS:", error.message);
    // Si hay un error, el sistema informa directamente en Telegram
    await ctx.reply("⚠️ NEXUS ALERTA: " + error.message);
  }
});

// 3. LANZAMIENTO
bot.launch()
  .then(() => console.log("🚀 SISTEMA NEXUS ONLINE CON MODELO 4-6"))
  .catch((err) => console.error("❌ FALLO DE INICIO:", err.message));

// Cierres de seguridad
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
