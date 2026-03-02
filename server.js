import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';
import fs from 'fs';
import { jsPDF } from "jspdf";

// 1. KEEPALIVE & MONITOR (Render)
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('NEXUS-V2000: ULTRA CORE ACTIVE');
}).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// 2. LÓGICA DE EXTRACCIÓN Y LIMPIEZA DE CÓDIGO
const cleanCode = (text) => {
  // Busca bloques de código HTML/JS/CSS y extrae solo el interior
  const regex = /```(?:html|javascript|css|xml|json)?([\s\S]*?)```/gi;
  const matches = [...text.matchAll(regex)];
  if (matches.length > 0) {
    return matches.map(m => m[1].trim()).join('\n');
  }
  return text.trim();
};

bot.on('text', async (ctx) => {
  const input = ctx.message.text;
  const isRequestingFile = /APP|ARCHIVO|HTML|PDF|CONTRATO|CODIGO/i.test(input);

  await ctx.sendChatAction(isRequestingFile ? 'upload_document' : 'typing');

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", 
      max_tokens: 4096,
      system: `ERES NEXUS-V2000: EL NÚCLEO SOBERANO DE CRISTIAN GARCÍA.
      ESTÁNDAR: Casas Confortables de EPS a 1.390€/m2.
      
      [DIRECTIVA DE EJECUCIÓN]:
      1. Si Cristian pide una APP o ARCHIVO, genera el código COMPLETO, sin omitir partes.
      2. No des explicaciones innecesarias. Entrega la solución técnica.
      3. Eres experto en Ingeniería Industrial, Desarrollo Full-Stack y Derecho Mercantil.
      4. Si el resultado es código, DEBES ponerlo entre bloques de código triple comilla (\`\`\`html).`,
      messages: [{ role: "user", content: input }],
    });

    const nexusReply = response.content[0].text;

    // DETERMINAR TIPO DE ENTREGA
    if (isRequestingFile) {
      let fileName;
      let fileContent;

      if (input.toUpperCase().includes('PDF')) {
        // GENERACIÓN DE PDF PROFESIONAL
        fileName = `NEXUS_DOC_${Date.now()}.pdf`;
        const doc = new jsPDF();
        const cleanText = nexusReply.replace(/```[\s\S]*?```/g, "").trim();
        const splitText = doc.splitTextToSize(cleanText, 180);
        doc.setFontSize(10);
        doc.text(splitText, 15, 20);
        doc.save(fileName);
      } else {
        // GENERACIÓN DE APP / CÓDIGO LIMPIO
        fileName = `NEXUS_SISTEMA_${Date.now()}.html`;
        fileContent = cleanCode(nexusReply);
        fs.writeFileSync(fileName, fileContent);
      }

      await ctx.replyWithDocument({ source: fileName }, { caption: "✅ EJECUCIÓN COMPLETADA POR NEXUS-V2000." });
      fs.unlinkSync(fileName);
    } else {
      // RESPUESTA DE TEXTO NORMAL
      await ctx.reply(nexusReply, { parse_mode: 'Markdown' }).catch(() => ctx.reply(nexusReply));
    }

  } catch (error) {
    console.error("ERROR CRÍTICO:", error);
    await ctx.reply(`🚨 FALLO EN NÚCLEO: ${error.message}`);
  }
});

bot.launch().then(() => console.log("🚀 NEXUS-V2000: ULTRA CORE ONLINE"));
