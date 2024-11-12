# Use uma imagem oficial do Node.js como base
FROM node:18

# Defina o diretório de trabalho no contêiner
WORKDIR /app

# Copie o arquivo package.json e package-lock.json (se houver) para o diretório de trabalho
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante do código do projeto para o diretório de trabalho
COPY . .

# Exponha a porta que a aplicação irá utilizar (substitua pela porta correta se diferente)
EXPOSE 3000

# Defina as variáveis de ambiente necessárias (ajuste conforme necessário)
ENV NODE_ENV=production

# Defina o comando de inicialização
CMD ["npm", "start"]
