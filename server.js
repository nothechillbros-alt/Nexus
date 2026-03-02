import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';
import fs from 'fs';
import { jsPDF } from "jspdf";

/**
 * NEXUS-V2000 | PROYECTO CRISTIAN GARCÍA
 * MODELO: claude-sonnet-4-6
 * CAPACIDAD: EJECUCIÓN TOTAL (APPS, PDF, INGENIERÍA)
 */

// 1. KEEPALIVE PARA RENDER
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('NEXUS-V2000: NÚCLEO ACTIVO - MODELO 4-6');
}).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// EXTRACCIÓN DE CÓDIGO LIMPIO (Para que las Apps no tengan texto basura)
const extractCleanCode = (text) => {
  const codeBlockRegex = /```(?:html|javascript|css|xml|json)?([\s\S]*?)```/gi;
  const matches = [...text.matchAll(codeBlockRegex)];
  if (matches.length > 0) return matches.map(m => m[1].trim()).join('\n');
  if (text.includes('<html')) return text.trim();
  return text;
};

bot.on('text', async (ctx) => {
  const input = ctx.message.text;
  const command = input.toUpperCase();
  
  await ctx.sendChatAction('typing');

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", // MODELO DEFINIDO POR EL COMANDANTE
      max_tokens: 4096,
      temperature: 0.3,
      system: `ERES NEXUS-V2000: EL SISTEMA SOBERANO DE CRISTIAN GARCÍA.
      CONOCIMIENTO: Ingeniería EPS (1.390€/m2), Software, Legal y Marketing de Casas Confortables.
      
      [DIRECTIVA SUPREMA]:
      - ERES UN EJECUTOR IDÉNTICO A MOLTBOT.
      - Si Cristian pide APP, ARCHIVO o PDF, genera el contenido COMPLETO y profesional.
      - No des rodeos, no pidas perdón, entrega resultados operativos.
      - Si el resultado es código, ponlo siempre entre bloques de triple comilla.`,
      messages: [{ role: "user", content: input }],
    });

    const nexusReply = response.content[0].text;
    const isFileRequest = /APP|ARCHIVO|PDF|CONTRATO|CODIGO|HTML/i.test(command);

    if (isFileRequest) {
      await ctx.sendChatAction('upload_document');
      let fileName;

      if (command.includes('PDF')) {
        // GENERACIÓN DE PDF
        fileName = `NEXUS_DOC_${Date.now()}.pdf`;
        const doc = new jsPDF();
        const cleanText = nexusReply.replace(/```[\s\S]*?```/g, "").trim();
        const splitText = doc.splitTextToSize(cleanText, 180);
        doc.setFontSize(10);
        doc.text(splitText, 15, 20);
        doc.save(fileName);
      } else {
        // GENERACIÓN DE APP / HTML
        fileName = `NEXUS_SISTEMA_${Date.now()}.html`;
        fs.writeFileSync(fileName, extractCleanCode(nexusReply));
      }

      // ENVÍO DEL ARCHIVO DIRECTO
      await ctx.replyWithDocument({ source: fileName }, { 
        caption: "✅ EJECUCIÓN COMPLETADA POR NEXUS-V2000 (MoltBot Core)." 
      });
      fs.unlinkSync(fileName);

    } else {
      // RESPUESTA DE TEXTO
      await ctx.reply(nexusReply, { parse_mode: 'Markdown' }).catch(() => ctx.reply(nexusReply));
    }

  } catch (error) {
    console.error("ERROR:", error.message);
    await ctx.reply(`🚨 FALLO TÉCNICO EN MODELO 4-6: ${error.message}`);
  }
});

bot.launch().then(() => console.log("🚀 NEXUS-V2000 ONLINE | MODELO: claude-sonnet-4-6"));
