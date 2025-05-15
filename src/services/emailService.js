const { google } = require('googleapis');
const { refreshAccessToken } = require('./authService');

const gmail = google.gmail({ version: 'v1' });

async function fetchUnreadEmails() {
  try {
    const accessToken = await refreshAccessToken();
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const now = new Date();
    const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime() / 1000;
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() / 1000;

    const res = await gmail.users.messages.list({
      userId: 'me',
      q: `from:@evolutionit.com.br is:unread after:${startOfYesterday} before:${endOfToday}`,
      auth: oauth2Client,
    });

    const emails = [];
    for (const message of res.data.messages || []) {
      const emailData = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
        auth: oauth2Client,
      });

      const subjectHeader = emailData.data.payload.headers.find(
        (header) => header.name === 'Subject'
      );
      const subject = subjectHeader ? subjectHeader.value : 'Sem Assunto';

      const parts = emailData.data.payload.parts || [];
      let body = '';

      for (const part of parts) {
        if (part.mimeType === 'text/plain') {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        } else if (part.mimeType === 'text/html') {
          body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          break;
        }
      }

      // Limpeza básica do corpo
      body = body.trim();
      // 📌 Capturar o último responsável pelo ticket (última assinatura)
      const signatureMatches = [...body.matchAll(/(?:att|atenciosamente|Atenciosamente|Att)[.,\s]*([\w\s]+)\*?/gim)];
      const responsibleName = signatureMatches.length > 0
        ? signatureMatches[signatureMatches.length - 1][1].replace(/\r?\n|\r/g, '').trim()
        : 'Desconhecido';

      // Remover "*" do final, se presente
      const cleanResponsibleName = responsibleName.replace(/\*+$/, '').trim();

      console.log("Responsável: ", cleanResponsibleName);

      // 🔍 Remover histórico do incidente e blocos fixos
      body = body.split(/----------------------------------------/)[0].trim();
      body = body.replace(/---Arquivos-----------------------------[\s\S]*?$/g, '');
      body = body.replace(/--\s+Você recebeu esta notificação[\s\S]*?https:\/\/redmine\.evtit\.com\/my\/account/g, '');


      // Formata a mensagem para envio ao Google Chat
      const formattedMessage = `
        ⚠️ <b>Atualização de Chamado</b> ⚠️<br>
        <b>Chamado:</b> ${subject}<br><br>
        <b>Responsável:</b> ${cleanResponsibleName}<br><br>
        <b>Mensagem:</b><br>${body}
      `;

      emails.push({
        id: message.id,
        threadId: message.threadId,
        subject,
        body,
        formattedMessage,
        responsible: cleanResponsibleName,
        internalDate: emailData.data.internalDate,
      });
    }

    return emails;
  } catch (error) {
    console.error('[ERROR] Falha ao buscar e-mails:', error);
    throw error;
  }
}

module.exports = { fetchUnreadEmails };
