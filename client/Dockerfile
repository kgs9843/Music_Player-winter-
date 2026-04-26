# client/Dockerfile
FROM node:20-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 종속성 설치
COPY ./package.json ./package-lock.json ./
RUN npm install

# 앱 복사
COPY . .

# Vite 개발 서버 실행
CMD ["npm", "run", "dev", "--", "--host"]