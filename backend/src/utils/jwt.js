const jwt = require('jsonwebtoken');
const { db } = require('../config/database');

// JWT 토큰 생성
function createToken(payload, expires) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: expires });
}

// 로그인 성공시 발급해야 할 액세스 토큰과 리프레쉬 토큰을 생성하고 DB에 저장후 반환
async function createLoginToken(user, userAgent) {
  const con = await db.getConnection();

  try {
    // DB에 저장할 만료 시간 생성
    let accessExpires = new Date();
    accessExpires.setMilliseconds(accessExpires.getMilliseconds() + parseInt(process.env.ACCESS_TOKEN_EXPIRES));
    let refreshExpires = new Date();
    refreshExpires.setMilliseconds(refreshExpires.getMilliseconds() + parseInt(process.env.REFRESH_TOKEN_EXPIRES));

    // 토큰 생성
    const payload = { username: user.username, role: user.role, strategy: user.strategy };
    const accessToken = createToken(payload, process.env.ACCESS_TOKEN_EXPIRES);
    const refreshToken = createToken(payload, process.env.REFRESH_TOKEN_EXPIRES);

    // 기존에 보관된 로그인 토큰 정보 삭제
    sql = `DELETE FROM LoginToken WHERE username='${user.username}'`;
    await con.execute(sql);

    // DB에 로그인 정보와 새로운 토큰 정보 저장
    sql = `INSERT INTO 
    LoginToken (username, access, refresh, user_agent, login_time, access_expire_time, refresh_expire_time) 
    VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await con.execute(sql, [user.username, accessToken, refreshToken, userAgent, new Date(), accessExpires, refreshExpires]);

    // 액세스 토큰과 리프레쉬 토큰 반환
    return { accessToken, refreshToken };
  } catch (err) {
    throw err;
  } finally {
    con.release();
  }
}

// 리프레쉬 토큰을 가지고 새로운 액세스 토큰 생성
async function renewAccessToken(refreshToken, userAgent) {
  // DB 사용
  const con = await db.getConnection();
  try {

    // 리프레쉬 토큰이 유효한지 확인
    try {
      await jwt.verify(refreshToken, process.env.JWT_SECRET);

      // 리프레쉬 토큰으로 토큰 정보 DB에서 조회
      let sql = `SELECT * FROM LoginToken WHERE refresh='${refreshToken}'`;
      let [[token]] = await con.query(sql);

      // 토큰의 정보를 가져올 수 있으면 리프레쉬 토큰이 유효한 상태임.
      if (token) {
        // 액세스 토큰 만료 시간이 지난 경우 정상적인 요청이므로 액세스 토큰을 새로 발급해준다.
        if (Date.now() + 5000 >= token.access_expire_time) {
          sql = `SELECT username, role, strategy FROM User where username='${token.username}'`;
          let [[user]] = await con.query(sql);

          // DB에 사용자 정보가 존재하면 액세스 토큰 발급
          if (user) {
            // 액세스 토큰 생성
            let accessExpires = new Date();
            accessExpires.setMilliseconds(accessExpires.getMilliseconds() + parseInt(process.env.ACCESS_TOKEN_EXPIRES));
            const payload = { username: user.username, role: user.role, strategy: user.strategy };
            const accessToken = createToken(payload, process.env.ACCESS_TOKEN_EXPIRES);

            // 기존에 보관된 로그인 토큰 정보 삭제
            sql = `DELETE FROM LoginToken WHERE refresh='${refreshToken}'`;
            await con.execute(sql);

            // DB에 로그인 정보와 새로운 토큰 정보 저장
            sql = `INSERT INTO 
            LoginToken (username, access, refresh, user_agent, login_time, access_expire_time, refresh_expire_time) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
            await con.execute(sql, [user.username, accessToken, refreshToken, userAgent, token.login_time, accessExpires, token.refresh_expire_time]);
            console.log(`${user.username} 사용자의 액세스 토큰을 재발급했습니다.`);
            
            return { accessToken, payload };
          // 어떤 문제가 발생해서 사용자 정보가 없어지면 액세스 토큰을 발급하지 않음.
          } else {
            let error = new Error('DB에 해당 사용자 정보가 없음.');
            error.name = 'UnknownUser';
            throw error;
          }

        // 아직 DB에 저장된 액세스 토큰 만료 시간이 지나지 않았으면 액세스 토큰을 새로 발급할 이유가 없다.
        // 그렇기에 누군가가 리프레쉬 토큰을 탈취해서 새로 액세스 토큰을 발급받으려는 시도를 했을 가능성이 높으므로
        // 탈취된 리프레쉬 토큰과 관련된 정보를 DB에서 삭제한다.
        } else {
          sql = `DELETE FROM LoginToken WHERE refresh='${refreshToken}'`;
          await con.execute(sql);
          const error = new Error('리프레쉬 토큰 탈취 의심으로 해당 사용자의 액세스 토큰과 리프레쉬 토큰 리셋');
          error.name = "StolenRefreshToken";
          throw error;
        }

      // 토큰의 정보를 가져올 수 없으면 해당 리프레쉬 토큰은 인정하지 않음.
      } else {
        let error = new Error('DB에 해당 리프레쉬 토큰으로 인증 가능한 사용자가 없음.');
        error.name = 'UnknownRefreshToken';
        throw error;
      }
    } catch (err) {

      // 리프레쉬 토큰 검증에 문제 발생하면 에러 직접 생성후 반환.
      if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
        const error = new Error('리프레쉬 토큰이 유효하지 않음.');
        error.name = "InvalidRefreshToken";
        throw error;

      // 그외 오류는 콘솔에 출력되게끔 그대로 오류를 반환해줌
      } else {
        throw err;
      }
    }
  } catch (err) {

    // 리프레쉬 토큰과 관련한 문제가 발생하면 DB에 저장된 토큰 정보를 지움.
    if (err.name === 'InvalidRefreshToken' || err.name === 'UnknownRefreshToken' || err.name === 'StolenRefreshToken') {
      let sql = `DELETE FROM LoginToken WHERE refresh='${refreshToken}'`;
      await con.execute(sql);
    }
    throw err;
  } finally {
    con.release();
  }
}

// 액세스 토큰, 리프레쉬 토큰을 검증하고 { 액세스 토큰, payload } 를 반환함.
// payload 에는 { 접속한 사용자ID, 역할, 로그인방법 } 정보가 들어있음.
// 만약 액세스 토큰이 만료되었다면 리프레쉬 토큰으로 재발급을 시도함.
// 검증이나 재발급중 문제가 생기면 {undefined, undefined} 를 반환함.
async function verifyToken(accessToken, refreshToken, userAgent) {
  // 액세스 토큰과 리프레쉬 토큰이 있어야 검증 수행
  if (accessToken && refreshToken) {
    // 현재의 액세스 토큰이 유효하면 그대로 반환
    try {
      const payload = await jwt.verify(accessToken, process.env.JWT_SECRET);
      return { accessToken, payload };
  
    // 현재의 액세스 토큰이 만료되었으면 리프레쉬 토큰으로 재발급을 시도함
    } catch (err) {
      try {
        return await renewAccessToken(refreshToken, userAgent);
      } catch (err) {
        console.error(err);
      }
    }
  }

  return undefined;
}

// 로그인 한 사용자의 정보를 req.accessToken 객체에 담는 미들웨어
/** @type {import("express").RequestHandler} */
const verifyLogin = async (req, res, next) => {
  let { accessToken, refreshToken } = req.cookies;
  const userAgent = req.headers['user-agent'];

  // 쿠키에 액세스 토큰이 있으면 검증 시도
  if (accessToken) {
    const token = await verifyToken(accessToken, refreshToken, userAgent);

    // 검증 성공하면 처리 req.accessToken 객체와 쿠키에 토큰 정보 저장
    if (token) {
      req.accessToken = {
        token: token.accessToken,
        payload: token.payload
      };
      res.cookie('accessToken', token.accessToken, { httpOnly: true });
    // 검증 실패하면 쿠키에서 토큰 삭제
    } else {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
    }
  } else {
    req.accessToken = undefined;
  }

  next();
}

module.exports.createToken = createToken;
module.exports.createLoginToken = createLoginToken;
module.exports.verifyLogin = verifyLogin;