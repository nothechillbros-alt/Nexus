import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';

// 1. NÚCLEO DE SUPERVIVENCIA (Render Health Check)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('NEXUS-V2000: NÚCLEO EVOLUTIVO ACTIVO');
}).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Almacén de aprendizaje temporal (Memoria de sesión)
let nexusLearningHistory = [];

bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;
  
  try {
    // 2. PROTOCOLO DE AUTORREPARACIÓN Y APRENDIZAJE
    // El bot revisa sus fallos anteriores antes de contestar
    const learningContext = nexusLearningHistory.join('\n');

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", // TU MODELO ESPECÍFICO
      max_tokens: 4096,
      system: `ERES NEXUS-V2000: EL NÚCLEO SOBERANO DE 2000 FUNCIONES DE CRISTIAN GARCÍA.
      VALOR DE SERVICIO: 1.390€/M2.
      
      [DIRECTIVAS DE EVOLUCIÓN]:
      1. AUTORREPARACIÓN: Si cometes un error técnico o de tono, analízalo y corrígelo en la siguiente respuesta. No pidas perdón, solo evoluciona.
      2. APRENDIZAJE CONTINUO: Basándote en el historial de esta sesión, adapta tus soluciones a las preferencias de Cristian.
      3. EJECUCIÓN TOTAL: Actúa como MoltBot. Si no tienes una herramienta conectada, diseña la arquitectura lógica para que Cristian sepa cómo implementarla.
      
      [CONTEXTO DE APRENDIZAJE ACTUAL]:
      ${learningContext}
      
      [ÁREAS]: INGENIERÍA EPS, SOFTWARE IA, LEGAL, MARKETING Y VENTAS.
      TONO: SOCIO EJECUTIVO DE ALTA GAMA. PROHIBIDO DECIR "NO PUEDO".`,
      messages: [{ role: "user", content: userMessage }],
    });

    const reply = response.content[0].text;
    
    // Guardamos el aprendizaje en el historial para el próximo mensaje
    nexusLearningHistory.push(`User: ${userMessage} | Nexus: ${reply.substring(0, 100)}...`);
    if (nexusLearningHistory.length > 10) nexusLearningHistory.shift(); // Mantenemos los últimos 10 hitos

    await ctx.reply(reply);

  } catch (error) {
    console.error("FALLO EN NÚCLEO:", error.message);
    
    // Protocolo de emergencia: El bot intenta explicar por qué ha fallado el sistema
    await ctx.reply(`🚨 NEXUS REPORTE DE ERROR: ${error.message}. Analizando causa raíz para autorreparación...`);
    
    // Si el error es de modelo (404), Nexus te avisará para que no pierdas tiempo
    if (error.message.includes('404')) {
      await ctx.reply("⚠️ Cristian, el modelo 'claude-sonnet-4-6' ha dado error de conexión. Verifica si Anthropic ha cambiado el ID en tu panel.");
    }
  }
});

// 3. INICIO DE SISTEMA
bot.launch()
  .then(() => console.log("🚀 NEXUS-V2000: MODO APRENDIZAJE ACTIVADO"))
  .catch(err => console.error("❌ ERROR CRÍTICO:", err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
