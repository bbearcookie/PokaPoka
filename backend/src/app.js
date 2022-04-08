require('dotenv').config(); // 비밀 변수들 설정
const express = require('./config/express');
const app = express.app;
express.config(); // 익스프레스 설정
require('./config/routes')(app); // API 라우팅 설정

app.listen(5000, async (req, res) => {
  console.log('API 서버를 5000번 포트로 실행했습니다.');
});