import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';
import fs from 'fs';
import { jsPDF } from "jspdf";

http.createServer((req, res) => {
  res.writeHead(200);
  res.end('NEXUS-V2000: PROCESADOR DE ARCHIVOS LIMPIOS');
}).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

bot.on('text', async (ctx) => {
  const input = ctx.message.text.toUpperCase();
  await ctx.sendChatAction('upload_document');

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", 
      max_tokens: 4096,
      system: `ERES NEXUS-V2000. COMANDANTE: CRISTIAN GARCÍA. 
      DIRECTIVA: Si generas una APP o ARCHIVO, entrega ÚNICAMENTE el código dentro de bloques de código. 
      No añadidas introducciones ni textos fuera del bloque si es un archivo ejecutable.`,
      messages: [{ role: "user", content: ctx.message.text }],
    });

    const nexusReply = response.content[0].text;

    if (input.includes('APP') || input.includes('ARCHIVO') || input.includes('HTML')) {
      const fileName = `NEXUS_SISTEMA_${Date.now()}.html`;
      
      // EXTRACCIÓN LIMPIA: Buscamos lo que hay entre ```html y ```
      const match = nexusReply.match(/```(?:html)?([\s\S]*?)```/i);
      const cleanContent = match ? match[1].trim() : nexusReply;

      fs.writeFileSync(fileName, cleanContent);
      await ctx.replyWithDocument({ source: fileName }, { caption: "💻 APP OPERATIVA: Abre este archivo en tu navegador." });
      fs.unlinkSync(fileName);
    } 
    else if (input.includes('PDF')) {
      const fileName = `NEXUS_DOC_${Date.now()}.pdf`;
      const doc = new jsPDF();
      const text = nexusReply.replace(/```[\s\S]*?```/g, "").trim(); // Limpiamos bloques de código para el PDF
      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 15, 20);
      doc.save(fileName);
      await ctx.replyWithDocument({ source: fileName });
      fs.unlinkSync(fileName);
    } 
    else {
      await ctx.reply(nexusReply, { parse_mode: 'Markdown' }).catch(() => ctx.reply(nexusReply));
    }

  } catch (error) {
    await ctx.reply(`⚠️ ERROR EN EL NÚCLEO: ${error.message}`);
  }
});

bot.launch();
