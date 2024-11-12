// src/services/gmailService.js
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const { simpleParser } = require('mailparser'); // Importa o simpleParser para ler o conteúdo do e-mail

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

async function listEmails() {
  try {
    // Obter timestamps para o início de ontem e o fim do dia atual
    const now = new Date();
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime() / 1000;
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() / 1000;

    const res = await gmail.users.messages.list({
      userId: 'me',
      q: `from:@evolutionit.com.br is:unread after:${startOfYesterday} before:${endOfToday}`,
    });

    const emails = [];
    for (const message of res.data.messages || []) {
      const emailData = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full', // Formato completo para incluir o conteúdo do e-mail
      });

      // Extrair o cabeçalho "Subject"
      const subjectHeader = emailData.data.payload.headers.find(
        (header) => header.name === 'Subject'
      );
      const subject = subjectHeader ? subjectHeader.value : 'Sem Assunto';

      // Extrair o conteúdo do e-mail em texto simples
      const parts = emailData.data.payload.parts || [];
      let body = '';

      for (const part of parts) {
        if (part.mimeType === 'text/plain') {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        } else if (part.mimeType === 'text/html') {
          // Se o corpo em texto simples não estiver disponível, utilize o HTML (opcional)
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        }
      }

      emails.push({
        id: message.id,
        threadId: message.threadId,
        subject,
        body: body || 'Sem conteúdo', // Inclui o corpo do e-mail
      });
    }
    return emails;
  } catch (error) {
    console.error('Erro ao listar e-mails:', error);
    throw error;
  }
}

module.exports = { listEmails };
