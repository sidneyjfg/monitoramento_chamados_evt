const axios = require('axios');
const { CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN } = process.env;

let accessToken = null;
let tokenExpiryTime = null;

const refreshAccessToken = async () => {
  try {
    // Verifica se o token ainda é válido
    if (accessToken && Date.now() < tokenExpiryTime) return accessToken;

    const response = await axios.post('https://oauth2.googleapis.com/token', null, {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: REFRESH_TOKEN,
        grant_type: 'refresh_token',
      },
    });

    accessToken = response.data.access_token;
    tokenExpiryTime = Date.now() + response.data.expires_in * 1000;
    console.log('[INFO] Access token atualizado com sucesso.');
    return accessToken;
  } catch (error) {
    console.error('[ERROR] Falha ao atualizar access token:', error.message);
    throw error;
  }
};

module.exports = { refreshAccessToken };
