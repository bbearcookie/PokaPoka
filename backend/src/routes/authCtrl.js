const router = require('../config/express').router;
const { db } = require('../config/database');
const { makeSalt, encryptText } = require('../utils/encrypt');
const { checkSMSVerification } = require('../utils/sns');

// 회원가입 처리
router.post('/signup', async (req, res) => {
  const { password, password_check, name, nickname, favorite } = req.body;
  let { username, phone } = req.body;

  // 데이터 유효성 검사
  username = username.toLowerCase();
  console.log(username);
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
  if (!checkSMSVerification) return res.status(400).json({ message: '휴대폰 인증을 먼저 해주세요.' });

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
    sql = `INSERT INTO User
    (username, password, salt, strategy, name, nickname, phone, favorite)
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

// 로그인 처리
router.post('/login', async (req, res) => {
  return res.status(501).json({ message: 'end of line' });
});

// 로그아웃 처리
router.post('/logout', async (req, res) => {
  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;