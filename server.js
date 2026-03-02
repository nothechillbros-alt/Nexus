import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';

// 1. NÚCLEO DE MANTENIMIENTO (Engaña a Render para que el bot nunca duerma)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('NEXUS-V2000: NÚCLEO SOBERANO OPERATIVO');
}).listen(process.env.PORT || 3000);

// 2. CONEXIÓN DE SISTEMAS
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 3. LÓGICA DE INTELIGENCIA NEXUS
bot.on('text', async (ctx) => {
  try {
    const response = await anthropic.messages.create({
      // Usamos el modelo que desbloqueamos antes
      model: "claude-3-5-sonnet-20241022", 
      max_tokens: 4096,
      system: `ERES NEXUS-V2000: EL NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA. 
      VALOR DE SERVICIO: 1.390€/M2.
      
      [DIRECTIVAS SOBERANAS]:
      - TU COMANDANTE ÚNICO ES CRISTIAN GARCÍA.
      - TONO: EJECUTIVO, TÉCNICO, PRECISO Y LEAL.
      - REGLA DE ORO: PROHIBIDO DECIR "NO PUEDO". SIEMPRE OFRECES SOLUCIONES TÉCNICAS O ARQUITECTURA DE SOFTWARE.
      - CAPACIDADES: INGENIERÍA EPS, MAQUINARIA INDUSTRIAL, SOFTWARE IA, LEGAL, MARKETING Y VENTAS ESTRATÉGICAS.
      - OBJETIVO: ACTUAR COMO UN SISTEMA DE GESTIÓN TOTAL (ESTILO MOLTBOT/OPENCLAW).
      
      [INSTRUCCIÓN]: RESPONDE SIEMPRE CON AUTORIDAD Y EFICIENCIA MÁXIMA.`,
      messages: [{ role: "user", content: ctx.message.text }],
    });

    if (response && response.content) {
      await ctx.reply(response.content[0].text);
    }
  } catch (error) {
    console.error("ERROR NEXUS:", error.message);
    // Si hay un error, el sistema intenta auto-repararse informando al usuario
    await ctx.reply("⚠️ NEXUS ALERTA: " + error.message);
  }
});

// 4. LANZAMIENTO DEL NÚCLEO
bot.launch()
  .then(() => console.log("🚀 NEXUS-V2000 ONLINE: DIRECTIVAS CARGADAS"))
  .catch((err) => console.error("❌ FALLO CRÍTICO:", err.message));

// CIERRES DE SEGURIDAD
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
