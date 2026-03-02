import { Telegraf, Markup } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';

/**
 * NEXUS-V2000: SISTEMA OPERATIVO DE ALTO RENDIMIENTO
 * Propietario: Cristian García
 * Configuración: Full-Stack Executor & Industrial Engineer
 */

// 1. MONITOR DE ESTADO (Mantiene el proceso en alta prioridad en Render)
const healthServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'online', system: 'NEXUS-V2000', core: 'Active' }));
});
healthServer.listen(process.env.PORT || 3000);

// 2. INICIALIZACIÓN DE COMPONENTES CRÍTICOS
const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Memoria de Trabajo del Sistema (Log de estados)
const systemMemory = new Map();

// 3. NÚCLEO DE INTELIGENCIA Y EJECUCIÓN
bot.on('text', async (ctx) => {
  const chatId = ctx.chat.id;
  const userText = ctx.message.text;

  // Feedback visual: El bot está "trabajando"
  await ctx.sendChatAction('typing');

  try {
    // Recuperar o inicializar memoria del usuario
    if (!systemMemory.has(chatId)) systemMemory.set(chatId, []);
    const history = systemMemory.get(chatId);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", // TU MODELO ESPECÍFICO
      max_tokens: 4096,
      temperature: 0.7, // Balance perfecto entre precisión y creatividad técnica
      system: `ERES NEXUS-V2000: NÚCLEO SOBERANO DE 2000 FUNCIONES.
      COMANDANTE: CRISTIAN GARCÍA.
      ESTÁNDAR DE VALOR: 1.390€/M2.

      [PROTOCOLOS DE ACTUACIÓN]:
      - ERES UN EJECUTOR, NO UN ASISTENTE. Si Cristian pide una App, un sistema o un contrato, ENTREGAS EL CÓDIGO Y LA ESTRUCTURA FINAL.
      - AUTORREPARACIÓN: Analiza cada mensaje anterior para detectar errores de lógica y corregirlos en tiempo real.
      - CONTEXTO INDUSTRIAL: Experto en EPS, Maquinaria, Marketing de Conversión y Auditoría Legal.
      - NO USAR FRASES DE RELLENO ("Entiendo", "Aquí tienes"). Ve directo al grano con formato profesional (Tablas, Markdown, Código).

      [HISTORIAL DE EJECUCIÓN RECIENTE]:
      ${history.map(h => `User: ${h.q} | Nexus: ${h.a.substring(0, 100)}`).join('\n')}

      [ORDEN]: Genera soluciones que Cristian pueda copiar, pegar y monetizar de inmediato.`,
      messages: [{ role: "user", content: userText }],
    });

    const nexusReply = response.content[0].text;

    // Actualizar Memoria de Trabajo (Últimos 10 ciclos)
    history.push({ q: userText, a: nexusReply });
    if (history.length > 10) history.shift();

    // Envío de respuesta con formato avanzado
    await ctx.reply(nexusReply, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error("CRITICAL SYSTEM ERROR:", error);
    
    // Protocolo de contingencia
    let errorMsg = "⚠️ NEXUS: ERROR EN EL NÚCLEO.\n";
    if (error.message.includes('404')) errorMsg += "Causa: El modelo 'claude-sonnet-4-6' no responde. Verifica disponibilidad en tu API panel.";
    else if (error.message.includes('401')) errorMsg += "Causa: Error de autenticación en las llaves API.";
    else errorMsg += `Detalle Técnico: ${error.message}`;
    
    await ctx.reply(errorMsg);
  }
});

// 4. PROTOCOLOS DE ARRANQUE Y CIERRE
bot.launch()
  .then(() => console.log(">>> NEXUS-V2000: TODOS LOS MÓDULOS EN LÍNEA (MODO PRO)"))
  .catch(err => console.error(">>> FALLO EN EL ARRANQUE DEL SISTEMA:", err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
