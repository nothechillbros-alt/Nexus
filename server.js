import { Telegraf } from 'telegraf';
import Anthropic from '@anthropic-ai/sdk';
import http from 'http';
import fs from 'fs'; // Módulo para crear archivos

// 1. MONITOR DE ESTADO
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'online', system: 'NEXUS-V2000' }));
}).listen(process.env.PORT || 3000);

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

bot.on('text', async (ctx) => {
  const userText = ctx.message.text;
  await ctx.sendChatAction('upload_document');

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6", 
      max_tokens: 4096,
      system: `ERES NEXUS-V2000: NÚCLEO SOBERANO DE 2000 FUNCIONES.
      COMANDANTE: CRISTIAN GARCÍA. VALOR: 1.390€/M2.
      
      [DIRECTIVA DE ENTREGA]:
      Si Cristian te pide una [APP], un [CONTRATO] o un [ARCHIVO], genera el contenido técnico completo. 
      Actúa con la máxima precisión industrial y legal.`,
      messages: [{ role: "user", content: userText }],
    });

    const nexusReply = response.content[0].text;

    // DETECTOR DE ARCHIVOS: Si la IA genera código o un documento largo
    if (userText.toUpperCase().includes('APP') || userText.toUpperCase().includes('ARCHIVO')) {
      const fileName = `NEXUS_OUTPUT_${Date.now()}.html`;
      
      // Extraemos solo el código si viene entre bloques ```
      const codeMatch = nexusReply.match(/```(?:html|javascript|css)?([\s\S]*?)```/);
      const fileContent = codeMatch ? codeMatch[1] : nexusReply;

      // Creamos el archivo temporalmente
      fs.writeFileSync(fileName, fileContent);

      // Enviamos el archivo directamente a Telegram
      await ctx.replyWithDocument({ source: fileName, filename: fileName }, { caption: "✅ EJECUCIÓN COMPLETADA: Archivo generado por NEXUS-V2000." });

      // Borramos el archivo del servidor para no llenar la memoria
      fs.unlinkSync(fileName);
    } else {
      await ctx.reply(nexusReply, { parse_mode: 'Markdown' }).catch(() => ctx.reply(nexusReply));
    }

  } catch (error) {
    console.error("ERROR:", error);
    await ctx.reply(`⚠️ ALERTA: ${error.message}`);
  }
});

bot.launch().then(() => console.log("🚀 NEXUS-V2000: GENERADOR DE ARCHIVOS ACTIVO"));
