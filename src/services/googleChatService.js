// src/services/googleChatService.js
const axios = require('axios');
const { webhookUrl } = require('../config/googleChatConfig');

const sendToGoogleChat = async (message, evtNumber) => {
  try {
    const cardMessage = {
      cards: [
        {
          header: {
            title: "⚠️ Atualização de Chamado ⚠️",
            subtitle: `<b>Chamado #${evtNumber}</b>`,
          },
          sections: [
            {
              widgets: [
                {
                  textParagraph: {
                    text: message,
                  },
                },
                {
                  buttons: [
                    {
                      textButton: {
                        text: "Visualizar Chamado",
                        onClick: {
                          openLink: {
                            url: `https://redmine.evtit.com/issues/${evtNumber}`,
                          },
                        },
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    await axios.post(webhookUrl, cardMessage);
    console.log('Card enviado ao Google Chat com sucesso');
  } catch (error) {
    console.error('Erro ao enviar card ao Google Chat:', error.message);
  }
};

module.exports = { sendToGoogleChat };
