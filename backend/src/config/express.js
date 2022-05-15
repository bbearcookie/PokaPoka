const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const { db } = require('./database');

const app = express();
const router = express.Router();

module.exports.config = () => {
  app.use(express.json()); // express 4.16 버전부터는 body-parser가 내장되었음
  app.use(express.urlencoded({ extended: true })); // application/x-www-form-urlencoded 형태의 데이터 파싱 가능하게 설정
  app.use(express.static(path.join(process.env.INIT_CWD, "/public"))); // 정적 파일들 기본 폴더 설정
  app.use(cookieParser()); // 브라우저의 쿠키를 파싱 가능하도록 설정

  const dbOptions = {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
  };

  // 익스프레스 세션 설정
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore(dbOptions)
  }));


  // 클라이언트 서버로부터 들어오는 요청 허가
  const originList = [];
  if (process.env.CLIENT_SERVER_URL)
    originList.push(process.env.CLIENT_SERVER_URL);
  if (process.env.CLIENT_SERVER_URL_WITH_WWW)
    originList.push(process.env.CLIENT_SERVER_URL_WITH_WWW);

  const corsOptions = {
    origin: (origin, callback) => {
      if (originList.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true
  }
  app.use(cors(corsOptions));
}

module.exports.app = app;
module.exports.router = router;