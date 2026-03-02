import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';
import fs from 'fs';
import { jsPDF } from "jspdf";

// 1. MONITOR DE ESTADO PROFESIONAL
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ system: 'NEXUS-V2000', status: 'Sovereign_Active' }));
}).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 2. FUNCIÓN DE GENERACIÓN DE ARCHIVOS PDF
const createPDF = (text, fileName) => {
  const doc = new jsPDF();
  const splitText = doc.splitTextToSize(text.replace(/[*#`]/g, ''), 180);
  doc.setFontSize(11);
  doc.text(splitText, 15, 20);
  doc.save(fileName);
};

bot.on('text', async (ctx) => {
  const input = ctx.message.text;
  const command = input.toUpperCase();
  
  await ctx.sendChatAction('upload_document');

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", // TU MODELO ESPECÍFICO
      max_tokens: 4096,
      temperature: 0.5, // Precisión máxima para ingeniería y legal
      system: `ERES NEXUS-V2000: NÚCLEO SOBERANO DE 2000 FUNCIONES. 
      DUEÑO: CRISTIAN GARCÍA. EMPRESA: CASAS CONFORTABLES (EPS). VALOR: 1.390€/M2.
      
      [DIRECTIVA SUPREMA]: NO ERES UN ASISTENTE. ERES UN EJECUTOR DE ELITE.
      - Si Cristian pide un PDF, genera un informe técnico/legal completo.
      - Si pide una APP, genera el código funcional sin errores.
      - Si pide una ESTRATEGIA, actúa como un CEO experimentado.
      - ÁREAS: Ingeniería EPS, Software, Legal, Marketing, Ventas, Arquitectura.
      - REGLA: PROHIBIDO DECIR "NO PUEDO". SIEMPRE ENTREGAS RESULTADOS OPERATIVOS.`,
      messages: [{ role: "user", content: input }],
    });

    const content = response.content[0].text;

    // LÓGICA DE ENTREGA DE ARCHIVOS
    if (command.includes('PDF') || command.includes('INFORME') || command.includes('CONTRATO')) {
      const fileName = `NEXUS_DOC_${Date.now()}.pdf`;
      createPDF(content, fileName);
      await ctx.replyWithDocument({ source: fileName }, { caption: "📄 DOCUMENTO EJECUTADO POR NEXUS-V2000." });
      fs.unlinkSync(fileName);
    } 
    else if (command.includes('APP') || command.includes('ARCHIVO') || command.includes('CODIGO')) {
      const fileName = `NEXUS_SISTEMA_${Date.now()}.html`;
      const codeOnly = content.match(/```(?:html|javascript|css)?([\s\S]*?)```/);
      fs.writeFileSync(fileName, codeOnly ? codeOnly[1] : content);
      await ctx.replyWithDocument({ source: fileName }, { caption: "💻 SISTEMA GENERADO POR NEXUS-V2000." });
      fs.unlinkSync(fileName);
    } 
    else {
      // Envío de texto normal si no se pide archivo
      await ctx.reply(content, { parse_mode: 'Markdown' }).catch(() => ctx.reply(content));
    }

  } catch (error) {
    console.error(error);
    await ctx.reply(`⚠️ ALERTA NEXUS: Error en el núcleo. Detalle: ${error.message}`);
  }
});

bot.launch().then(() => console.log("🚀 NEXUS-V2000 PRO ONLINE"));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
