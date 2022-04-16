const router = require('../config/express').router;
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { db } = require('../config/database');
const { makeSalt, encryptText } = require('../utils/encrypt');
const { checkSMSVerification } = require('../utils/sns');
const { createToken, createLoginToken, verifyLogin } = require('../utils/jwt');
const { getURIEncode } = require('../utils/encode');

// 회원가입 처리
router.post('/signup', async (req, res) => {
  const { password, password_check, name, nickname, favorite } = req.body;
  let { username, phone } = req.body;
  const { smsVerification } = req.session;
  username = username.toLowerCase();

  // 데이터 유효성 검사
  if (!username) return res.status(400).json({ message: '아이디를 입력해주세요.' });
  if (/([^A-Za-z0-9])/.exec(username)) return res.status(400).json({ message: '아이디는 영문자와 숫자만 입력할 수 있습니다.' });
  if (username.length > 20) return res.status(400).json({ message: '아이디는 최대 20글자까지 입력할 수 있습니다.' });
  if (!password) return res.status(400).json({ message: '비밀번호를 입력해주세요.' });
  if (!password_check) return res.status(400).json({ message: '비밀번호 확인을 입력해주세요.' });
  if (password !== password_check) return res.status(400).json({ message: '비밀번호 확인이 일치하지 않아요.' });
  if (!name) return res.status(400).json({ message: '이름을 입력해주세요.' });
  if (name.length > 10) return res.status(400).json({ message: '이름은 최대 10글자까지 입력할 수 있습니다.' });
  if (!nickname) return res.status(400).json({ message: '닉네임을 입력해주세요.' });
  if (nickname.length > 20) return res.status(400).json({ message: '닉네임은 최대 20글자까지 입력할 수 있습니다.' });
  if (!favorite) return res.status(400).json({ message: '최애그룹을 입력해주세요.' });

  // 전화번호 유효성 검사
  if (!phone) return res.status(400).json({ message: '전화번호를 입력해주세요.' });
  let regex = /[^0-9]/g;
  phone = phone.replace(regex, ""); // 전화번호에서 숫자만 추출함.
  if (phone.length !== 11) return res.status(400).json({ message: '휴대폰 번호가 올바른 자릿수가 아닙니다.' });
  if (phone.substring(0, 2) !== '01') return res.status(400).json({ message: '휴대폰 번호는 01로 시작해야 합니다.' });

  // 휴대폰 인증 검사
  if (!checkSMSVerification(req)) return res.status(400).json({ message: '휴대폰 인증을 먼저 해주세요.' });
  if (phone !== smsVerification.phone) return res.status(400).json({ message: '입력한 휴대폰 번호와 인증된 휴대폰 번호가 다릅니다.' });

  // DB 사용
  const con = await db.getConnection();
  try {
    // 중복한 아이디 확인
    let sql = `SELECT username FROM User where username='${username}'`;
    let [[user]] = await con.query(sql);
    if (user) return res.status(400).json({ message: '이미 가입된 아이디입니다.' });

    // 중복한 휴대폰번호 확인
    sql = `SELECT phone FROM User where phone='${phone}'`;
    [[user]] = await con.query(sql);
    if (user) return res.status(400).json({ message: '이미 해당 휴대폰번호로 가입한 계정이 있습니다.' });

    // 회원가입 처리
    const salt = makeSalt();
    const encryptedPwd = encryptText(password, salt);
    sql = `INSERT INTO
    User (username, password, salt, strategy, name, nickname, phone, favorite)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    await con.execute(sql, [username, encryptedPwd, salt, 'local', name, nickname, phone, favorite]);

    return res.status(200).json({ message: '회원가입 성공' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 로컬 로그인 처리
router.post('/login/local', async (req, res) => {
  const { password } = req.body;
  let { username } = req.body;
  const userAgent = req.headers['user-agent'];

  // 데이터 유효성 검사
  if (!username) return res.status(400).json({ message: '아이디를 입력해주세요.' });
  if (!password) return res.status(400).json({ message: '비밀번호를 입력해주세요.' });

  username = username.toLowerCase();

  const con = await db.getConnection();
  try {
    // DB에서 사용자 정보 가져오기
    let sql = `
    SELECT username, password, salt, role, strategy, inactive
    FROM USER
    WHERE username='${username}'`;
    let [[user]] = await con.query(sql);

    // 가입 여부 확인
    if (!user) return res.status(404).json({ message: '가입되지 않은 아이디입니다.' });
    // 비활성화 여부 확인
    if (user.inactive) return res.status(406).json({ message: '비활성화된 계정입니다.' });
    // 로컬 로그인으로 가입된 계정 맞는지 확인
    if (user.strategy !== 'local') return res.status(403).json({ message: '로컬 로그인으로 가입된 계정이 아닙니다.' });
    // 비밀번호 확인
    if (user.password !== encryptText(password, user.salt)) return res.status(403).json({ message: '비밀번호가 다릅니다.' });

    // 토큰 발급
    const { accessToken, refreshToken } = await createLoginToken(user, userAgent);

    // 쿠키에 토큰 보관
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

    return res.status(200).json({ message: '로그인되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 카카오 로그인 처리
router.get('/login/kakao', async (req, res) => {
  const userAgent = req.headers['user-agent'];
  const { code } = req.query; // 사용자가 로그인 성공후 카카오 API가 우리에게 보내준 일회성 인증 코드. 액세스 토큰을 한번 생성하면 인증 코드는 소멸된다.
  const token = {}; // 카카오로부터 생성받은 토큰 관련 정보
  const provider = 'kakao'; // 로그인 방식. 사용자의 username 뒤에 _kakao 로 접미사가 붙으며 strategy 필드가 kakao로 설정된다.

  // 유효성 검사
  if (!code) return res.status(400).json({ message: '비정상적인 경로로 로그인을 시도하셨습니다.' });
  
  // 카카오에 토큰 생성 요청
  try {
    // 카카오 API가 요구하는 형태의 데이터 생성
    let payload = {
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_LOGIN_NATIVE_APP_KEY, // 백엔드 서버에서는 네이티브 앱 키로 요청해야함.
      client_secret: process.env.KAKAO_LOGIN_CLIENT_SECRET,
      redirect_uri: 'http://localhost:5000/api/auth/login/kakao',
      code: code, // 일회성 인증 코드 사용
    };
    let encodedPayload = getURIEncode(payload);
    let options = {
      headers: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8'
      }
    }

    // 토큰 생성 요청
    let result = await axios.post('https://kauth.kakao.com/oauth/token', encodedPayload, options);
    token['access'] = result.data.access_token; // 카카오 액세스 토큰
    token['refresh'] = result.data.refresh_token; // 카카오 리프레쉬 토큰
    token['scope'] = result.data.scope; // 로그인 한 사용자로부터 수집 가능한 데이터
    console.log(token);
  } catch (err) {
    const { error_code, error_description } = err.response.data;
    console.error(err.response.data);
    return res.status(500).json({ message: '로그인에 실패했습니다.', error_code, error_description });
  }

  // 카카오 액세스 토큰으로 사용자 정보 조회
  try {
    // 카카오 API가 요구하는 형태의 데이터 생성
    let options = {
      headers: {
        'Authorization': `Bearer ${token.access}`
      }
    }

    // 사용자 정보 조회 요청
    let result = await axios.get('https://kapi.kakao.com/v2/user/me', options);
    console.log(result.data);

    // 필요한 사용자 정보를 가져왔으니 필요 없어진 카카오 액세스 토큰을 폐기하기 위해 카카오 로그아웃 처리 요청
    await axios.post('https://kapi.kakao.com/v1/user/logout', undefined, options);

    // User 테이블에서 해당 사용자 정보가 있는지를 조회하고 있다면 로그인 처리하고 없다면 회원가입 후 로그인 처리해야함.
    const con = await db.getConnection();
    try {
      const username = `${result.data.id}_${provider}`; // 카카오 서버가 제공한 고유의 사용자 id에 _kakao를 붙혀서 사용한다.

      // DB에서 사용자 정보 가져오기
      let sql = `
      SELECT username, role, strategy, inactive
      FROM USER
      WHERE username='${username}'`;
      let [[user]] = await con.query(sql);

      // 카카오 로그인으로 처음 접속한거면 DB에 사용자 정보 생성
      if (!user) {
        sql = `INSERT INTO User (username, strategy, nickname) VALUES (?, ?, ?)`;
        await con.execute(sql, [username, provider, result.data.properties.nickname]);
      }

      // 토큰 발급
      const { accessToken, refreshToken } = await createLoginToken(user, userAgent);

      // 쿠키에 토큰 보관
      res.cookie('accessToken', accessToken, { httpOnly: true });
      res.cookie('refreshToken', refreshToken, { httpOnly: true });

      // 로그인 성공후 화면으로 리디렉션
      return res.redirect(process.env.SNS_LOGIN_REDIRECT_URL);
    } catch (err) {
      throw err;
    } finally {
      con.release();
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '로그인에 실패했습니다.' });
  }

  return res.status(501).json({ message: 'end of line' });
});

// 로그아웃 처리
router.post('/logout', async (req, res) => {
  const { accessToken, refreshToken } = req.cookies;

  const con = await db.getConnection();
  try {
    // DB에 저장된 로그인 토큰 정보 삭제
    let sql = `DELETE FROM LoginToken WHERE refresh='${refreshToken}'`;
    await con.execute(sql);

    // 쿠키에 있는 액세스 토큰, 리프레쉬 토큰 삭제
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return res.status(200).json({ message: '로그아웃 되었습니다.'});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 로그인 검증 기능 테스트
router.post('/login/test', verifyLogin, async (req, res) => {
  const { accessToken } = req;

  if (accessToken) {
    const { username, role, strategy } = accessToken.payload;
    return res.status(200).json({ message: `${username} 님 어서오세요! 당신은 ${strategy} 방식으로 로그인 하셨으며, 서비스 내에서 ${role} 역할을 맡고 있습니다.` });
  } else {
    return res.status(401).json({ message: '당신은 로그인 상태가 아닙니다.' });
  }

  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;