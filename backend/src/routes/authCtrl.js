const router = require('../config/express').router;
const axios = require('axios');
const { db } = require('../config/database');
const { makeSalt, encryptText } = require('../utils/encrypt');
const { checkSMSVerification } = require('../utils/sms');
const { createLoginToken, verifyLogin } = require('../utils/jwt');
const { getURIEncode } = require('../utils/encode');
const { getOAuthToken, OAuthLogin } = require('../utils/OAuth');

// 아이디 중복 확인
router.get('/username', async (req, res) => {
  const { username } = req.query;

  // 데이터 유효성 검사
  if (!username) return res.status(400).json({ message: '아이디를 입력해주세요.' });

  const con = await db.getConnection();
  try {
    // 중복한 아이디 확인
    let sql = `SELECT username FROM User where username='${username}'`;
    let [[user]] = await con.query(sql);
    if (user) return res.status(200).json({ message: `${username}은(는) 이미 가입된 아이디입니다.` });

    return res.status(200).json({ message: `${username}은(는) 가입 가능한 아이디입니다.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

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

  // 전화번호 유효성 검사
  if (!phone) return res.status(400).json({ message: '전화번호를 입력해주세요.' });
  let regex = /[^0-9]/g;
  phone = phone.replace(regex, ""); // 전화번호에서 숫자만 추출함.
  if (phone.length !== 11) return res.status(400).json({ message: '휴대폰 번호가 올바른 자릿수가 아닙니다.' });
  if (phone.substring(0, 2) !== '01') return res.status(400).json({ message: '휴대폰 번호는 01로 시작해야 합니다.' });

  // 휴대폰 인증 검사 //테스트할 때 매번 인증하지 않도록 잠시 주석처리
  // if (!checkSMSVerification(req)) return res.status(400).json({ message: '휴대폰 인증을 먼저 해주세요.' });
  // if (phone !== smsVerification.phone) return res.status(400).json({ message: '입력한 휴대폰 번호와 인증된 휴대폰 번호가 다릅니다.' });

  // DB 사용
  const con = await db.getConnection();
  try {
    // 중복한 아이디 확인
    let sql = `SELECT username FROM User where username='${username}'`;
    let [[user]] = await con.query(sql);
    if (user) return res.status(400).json({ message: '이미 가입된 아이디입니다.' });

    // // 중복한 휴대폰번호 확인 (중복 가능 유무 고민중)
    // sql = `SELECT phone FROM User where phone='${phone}'`;
    // [[user]] = await con.query(sql);
    // if (user) return res.status(400).json({ message: '이미 해당 휴대폰번호로 가입한 계정이 있습니다.' });

    // 중복한 닉네임 확인
    sql = `SELECT nickname FROM User where nickname='${nickname}'`;
    [[user]] = await con.query(sql);
    if (user) return res.status(400).json({ message: '이미 있는 닉네임입니다.' });

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
    FROM User
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

    return res.status(200).json({
      message: '로그인되었습니다.',
      username: user.username,
      role: user.role,
      strategy: user.strategy
    });
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
  const strategy = 'kakao'; // 로그인 방식. 사용자의 username 뒤에 _kakao 로 접미사가 붙으며 strategy 필드가 kakao로 설정된다.

  // 유효성 검사. 비정상적인 방법으로 로그인을 시도하면 로그인 페이지로 리디렉션.
  if (!code) return res.redirect(process.env.LOGIN_PAGE_URL);
  
  try {
    // 카카오에 액세스 토큰 생성 요청할때 담을 데이터
    let payload = {
      grant_type: 'authorization_code',
      client_id: process.env.KAKAO_LOGIN_NATIVE_APP_KEY, // 백엔드 서버에서는 네이티브 앱 키로 요청해야함.
      client_secret: process.env.KAKAO_LOGIN_CLIENT_SECRET,
      redirect_uri: 'http://localhost:5000/api/auth/login/kakao',
      code: code, // 일회성 인증 코드 사용
    };

    // 카카오 액세스 토큰과 리프레쉬 토큰을 요청함
    const token = await getOAuthToken('https://kauth.kakao.com/oauth/token', 'post', payload);

    // 카카오 액세스 토큰으로 사용자 정보 조회
    const result = await axios({
      url: 'https://kapi.kakao.com/v2/user/me',
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token.access}`
      }
    });

    // 사용자 정보를 가져왔으니 필요 없어진 액세스 토큰을 폐기하기 위해 카카오 로그아웃 처리 요청
    await axios({
      url: 'https://kapi.kakao.com/v1/user/logout',
      method: 'post',
      headers: {
        'Authorization': `Bearer ${token.access}`
      }
    });

    // 카카오가 제공해준 사용자 정보를 가지고 우리 서비스의 사용자 정보와 매칭한다.
    const username = `${result.data.id}_${strategy}`; // 카카오 서버가 제공한 고유의 사용자 id에 _kakao를 붙혀서 사용한다.
    const nickname = result.data.properties.nickname;
    const user = await OAuthLogin(username, strategy, nickname); // 우리 서비스에서의 사용자 정보
    console.log(user);

    // 계정이 비활성화 상태이면 로그인 불가
    if (user.inactive)
      return res.redirect(process.env.LOGIN_PAGE_URL + "/?message=비활성화된 계정입니다.");

    // 토큰 발급
    const { accessToken, refreshToken } = await createLoginToken(user, userAgent);

    // 쿠키에 토큰 보관
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

    // 로그인 성공후 화면으로 리디렉션
    return res.redirect(process.env.LOGIN_REDIRECT_URL);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 문제로 로그인에 실패했습니다.' });
  }

  return res.status(501).json({ message: 'end of line' });
});

// 네이버 로그인 처리
router.get('/login/naver', async (req, res) => {
  const userAgent = req.headers['user-agent'];
  const { code, state } = req.query;
  const strategy = 'naver';

  // 유효성 검사. 비정상적인 방법으로 로그인을 시도하면 로그인 페이지로 리디렉션.
  if (!code) return res.redirect(process.env.LOGIN_PAGE_URL);
  
  try {
    // 네이버에 액세스 토큰 생성 요청할때 담을 데이터
    let payload = {
      grant_type: 'authorization_code',
      client_id: process.env.NAVER_LOGIN_CLIENT_ID,
      client_secret: process.env.NAVER_LOGIN_CLIENT_SECRET,
      code,
      state
    };

    // 네이버 액세스 토큰과 리프레쉬 토큰을 요청함
    const token = await getOAuthToken('https://nid.naver.com/oauth2.0/token', 'post', payload);

    // 네이버 액세스 토큰으로 사용자 정보 조회
    const result = await axios({
      url: 'https://openapi.naver.com/v1/nid/me',
      method: 'get',
      headers: {
        'Authorization': `Bearer ${token.access}`
      }
    });

    // 사용자 정보를 가져왔으니 필요 없어진 액세스 토큰을 폐기하기 위해 네이버에 폐기 요청
    await axios({
      url: 'https://nid.naver.com/oauth2.0/token',
      method: 'post',
      data: getURIEncode({
        grant_type: 'delete',
        client_id: process.env.NAVER_LOGIN_CLIENT_ID,
        client_secret: process.env.NAVER_LOGIN_CLIENT_SECRET,
        access_token: token.access,
        service_provider: strategy
      })
    });

    // 네이버가 제공해준 사용자 정보를 가지고 우리 서비스의 사용자 정보와 매칭한다.
    const username = `${result.data.response.id}_${strategy}`; // 카카오 서버가 제공한 고유의 사용자 id에 _kakao를 붙혀서 사용한다.
    const nickname = result.data.response.nickname;
    const user = await OAuthLogin(username, strategy, nickname); // 우리 서비스에서의 사용자 정보
    console.log(user);

    // 계정이 비활성화 상태이면 로그인 불가
    if (user.inactive)
      return res.redirect(process.env.LOGIN_PAGE_URL + "/?message=비활성화된 계정입니다.");

    // 토큰 발급
    const { accessToken, refreshToken } = await createLoginToken(user, userAgent);

    // 쿠키에 토큰 보관
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

    // 로그인 성공후 화면으로 리디렉션
    return res.redirect(process.env.LOGIN_REDIRECT_URL);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 문제로 로그인에 실패했습니다.' });
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

// 액세스 토큰의 유효성을 검사하여 토큰에 들어있는 payload를 반환하는 기능
router.post('/token/test', verifyLogin, async (req, res) => {
  const { accessToken } = req;

  if (accessToken) {
    const { username, role, strategy } = accessToken.payload;
    return res.status(200).json({
      message: `${username} 님 어서오세요! 당신은 ${strategy} 방식으로 로그인 하셨으며, 서비스 내에서 ${role} 역할을 맡고 있습니다.`,
      username, role, strategy
    });
  } else {
    return res.status(401).json({ message: '당신은 로그인 상태가 아닙니다.' });
  }

  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;