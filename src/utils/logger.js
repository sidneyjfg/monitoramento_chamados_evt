// src/utils/logger.js
const logInfo = (message) => console.info(`[INFO] ${message}`);
const logError = (message) => console.error(`[ERROR] ${message}`);

module.exports = { logInfo, logError };
