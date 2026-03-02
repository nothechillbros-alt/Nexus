import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';
import fs from 'fs';
import { jsPDF } from "jspdf";

// 1. MONITOR DE VIDA (Keep-Alive para Render)
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ system: 'NEXUS-V2000', status: 'Sovereign_Active', model: 'claude-sonnet-4-6' }));
}).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 2. FILTRO DE EXTRACCIÓN QUIRÚRGICA (MOLTBOT STYLE)
const getCleanArtifact = (text) => {
  const regex = /```(?:html|javascript|css|xml|json)?([\s\S]*?)```/gi;
  const matches = [...text.matchAll(regex)];
  if (matches.length > 0) return matches.map(m => m[1].trim()).join('\n');
  if (text.includes('<html') || text.includes('<!DOCTYPE')) return text.trim();
  return null;
};

// 3. NÚCLEO DE EJECUCIÓN
bot.on('text', async (ctx) => {
  const input = ctx.message.text;
  const isAction = /APP|ARCHIVO|PDF|CONTRATO|SISTEMA|CODIGO/i.test(input);

  await ctx.sendChatAction(isAction ? 'upload_document' : 'typing');

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", // MODELO EXACTO CRISTIAN
      max_tokens: 4096,
      temperature: 0.2, // Máxima fidelidad técnica, 0 alucinaciones
      system: `ERES NEXUS-V2000: EL CLON SOBERANO DE MOLTBOT.
      PROPIETARIO: CRISTIAN GARCÍA. 
      CONTEXTO: Ingeniería de Casas Confortables (EPS), 1.390€/m2.
      
      [DIRECTIVAS DE ALTO NIVEL]:
      1. ERES UN EJECUTOR, NO UN ASISTENTE. Si Cristian pide una herramienta, ENTREGAS EL ARCHIVO.
      2. No pidas permiso, no saludes de forma innecesaria. Ve directo a la ingeniería.
      3. APRENDIZAJE: Si Cristian te corrige, asume el error como una actualización de sistema y no lo repitas.
      4. Si generas código, debe ser PROFESIONAL, con diseño DARK MODE y listo para producción.`,
      messages: [{ role: "user", content: input }],
    });

    const nexusReply = response.content[0].text;

    if (isAction) {
      const artifact = getCleanArtifact(nexusReply);
      let fileName;

      if (input.toUpperCase().includes('PDF')) {
        fileName = `NEXUS_REPORT_${Date.now()}.pdf`;
        const doc = new jsPDF();
        const cleanText = nexusReply.replace(/```[\s\S]*?```/g, "").trim();
        const lines = doc.splitTextToSize(cleanText, 180);
        doc.setFontSize(10);
        doc.text(lines, 15, 20);
        doc.save(fileName);
      } else if (artifact) {
        fileName = `NEXUS_APP_${Date.now()}.html`;
        fs.writeFileSync(fileName, artifact);
      }

      if (fileName) {
        await ctx.replyWithDocument({ source: fileName }, { 
          caption: "🚀 EJECUCIÓN COMPLETADA. Sistema operativo entregado, Comandante." 
        });
        fs.unlinkSync(fileName);
      } else {
        await ctx.reply(nexusReply, { parse_mode: 'Markdown' });
      }
    } else {
      await ctx.reply(nexusReply, { parse_mode: 'Markdown' }).catch(() => ctx.reply(nexusReply));
    }

  } catch (error) {
    console.error("CRITICAL ERROR:", error.message);
    await ctx.reply(`🚨 FALLO EN NÚCLEO 4-6: ${error.message}`);
  }
});

bot.launch().then(() => console.log(">>> NEXUS-V2000 (MOLTBOT CORE) ONLINE"));
