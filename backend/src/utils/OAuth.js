const axios = require('axios');
const { db } = require('../config/database');
const { getURIEncode } = require('./encode');

// 외부 서비스에 요청하여 액세스 토큰, 리프레쉬 토큰을 반환받는다.
async function getOAuthToken(url, method, payload) {
  try {
    // 토큰 생성 요청
    const result = await axios({
      url,
      method,
      data: getURIEncode(payload),
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    });
    
    // 액세스 토큰과 리프레쉬 토큰 정리
    const token = {
      access: result.data.access_token,
      refresh: result.data.refresh_token
    };

    // 토큰 반환
    return token;
  } catch (err) {
    throw err;
  }
}

// 외부 서비스로부터 받은 정보를 이용해 우리 서비스에 가입된 회원 정보를 반환한다. 처음 로그인 시도하는거면 회원 정보를 생성하고 반환해준다.
async function OAuthLogin(userData) {
  const con = await db.getConnection();
  
  try {
    // DB에서 사용자 정보 가져오기
    let sql = `
    SELECT username, role, strategy, inactive
    FROM USER
    WHERE username='${userData.username}'`;
    let [[user]] = await con.query(sql);

    // 해당 외부 로그인으로 처음 접속했으면 DB에 사용자 정보 생성
    if (!user) {
      sql = `INSERT INTO User (username, strategy, nickname, phone, name) VALUES (?, ?, ?, ?, ?)`;
      await con.execute(sql, [userData.username, userData.strategy, userData.nickname, userData.phone, userData.name]);
      user = {
        username: userData.username,
        role: 'user',
        strategy: userData.strategy,
        inactive: 0
      }
    }

    return user;
  } catch (err) {
    throw err;
  } finally {
    con.release();
  }
}

module.exports.getOAuthToken = getOAuthToken;
module.exports.OAuthLogin = OAuthLogin;