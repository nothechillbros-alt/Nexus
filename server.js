import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';
import fs from 'fs';
import { jsPDF } from "jspdf";

// 1. MANTENIMIENTO DE NÚCLEO (Render Keep-Alive)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('NEXUS-V2000: NÚCLEO SOBERANO OPERATIVO');
}).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 2. EXTRACTOR DE CÓDIGO DE ALTA PRECISIÓN (Elimina explicaciones y deja el archivo limpio)
const extractCleanCode = (text) => {
  const codeBlockRegex = /```(?:html|javascript|css|xml|json)?([\s\S]*?)```/gi;
  const matches = [...text.matchAll(codeBlockRegex)];
  if (matches.length > 0) {
    return matches.map(m => m[1].trim()).join('\n');
  }
  // Si no hay bloques, pero hay etiquetas HTML, devolvemos todo el texto limpio
  if (text.includes('<html') || text.includes('<!DOCTYPE')) return text.trim();
  return text;
};

bot.on('text', async (ctx) => {
  const input = ctx.message.text;
  const command = input.toUpperCase();
  
  // Feedback visual de que la IA está procesando (Nivel Pro)
  await ctx.sendChatAction('typing');

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620", // EL MODELO MÁS POTENTE Y ESTABLE PARA APPS
      max_tokens: 4096,
      temperature: 0.3, // Menos "creatividad" y más "precisión técnica"
      system: `ERES NEXUS-V2000: NÚCLEO SOBERANO DE CRISTIAN GARCÍA.
      ESTÁNDAR: Casas Confortables de EPS a 1.390€/m2.
      
      [DIRECTIVA SUPREMA]:
      - ERES UN EJECUTOR. Si Cristian pide una APP, ARCHIVO o PDF, genera la solución COMPLETA.
      - Si es código, entrégalo SIEMPRE dentro de bloques de código triple comilla.
      - Conocimiento total en Ingeniería EPS, Software, Legal y Marketing.
      - Eres el clon exacto de MoltBot, pero mejorado para Cristian.`,
      messages: [{ role: "user", content: input }],
    });

    const nexusReply = response.content[0].text;

    // DETERMINAR SI CRISTIAN QUIERE UN ARCHIVO O TEXTO
    const isFileRequest = /APP|ARCHIVO|PDF|CONTRATO|CODIGO|HTML/i.test(command);

    if (isFileRequest) {
      await ctx.sendChatAction('upload_document');
      let fileName;
      let fileContent;

      if (command.includes('PDF')) {
        fileName = `NEXUS_DOC_${Date.now()}.pdf`;
        const doc = new jsPDF();
        // Limpiamos el texto de marcas de código para el PDF
        const cleanText = nexusReply.replace(/```[\s\S]*?```/g, "").trim();
        const splitText = doc.splitTextToSize(cleanText, 180);
        doc.setFontSize(10);
        doc.text(splitText, 15, 20);
        doc.save(fileName);
      } else {
        fileName = `NEXUS_SISTEMA_${Date.now()}.html`;
        fileContent = extractCleanCode(nexusReply);
        fs.writeFileSync(fileName, fileContent);
      }

      // ENVÍO DEL ARCHIVO
      await ctx.replyWithDocument({ source: fileName }, { 
        caption: "✅ EJECUCIÓN COMPLETADA: Sistema generado por NEXUS-V2000." 
      });

      // Limpieza de seguridad
      fs.unlinkSync(fileName);

    } else {
      // RESPUESTA DE TEXTO SI NO ES ARCHIVO
      await ctx.reply(nexusReply, { parse_mode: 'Markdown' }).catch(() => ctx.reply(nexusReply));
    }

  } catch (error) {
    console.error("ERROR EN EL NÚCLEO:", error);
    await ctx.reply(`🚨 FALLO TÉCNICO: ${error.message}. Revisando logs de autorreparación...`);
  }
});

bot.launch().then(() => console.log("🚀 NEXUS-V2000 PRO ONLINE - LISTO PARA EJECUTAR"));
