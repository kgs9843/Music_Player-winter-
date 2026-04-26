FROM node:20-alpine

# Python, bash, ffmpeg 설치 (python3, py3-pip 포함)
RUN apk add --no-cache python3 py3-pip bash ffmpeg

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p ./temp

EXPOSE 3000

CMD ["node", "server.js"]