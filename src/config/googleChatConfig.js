// src/config/googleChatConfig.js
require('dotenv').config();

module.exports = {
  webhookUrl: process.env.GOOGLE_CHAT_WEBHOOK_URL,  // URL do webhook do Google Chat
};
