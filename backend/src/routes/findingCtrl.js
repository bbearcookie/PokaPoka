const router = require('../config/express').router;
const { db } = require('../config/database');
const { checkSMSVerification } = require('../utils/sms');
const { makeSalt, encryptText } = require('../utils/encrypt');

//아이디 찾기
// DB SELECT
router.get('/findId', async (req, res) => {
  const con = await db.getConnection(); // DB에 접근 가능한 커넥션 반환받음.
  const { name, phone } = req.query;

  if (!name || !phone) {
    return res.status(400).json({ message: '이름과 전화번호를 입력해주세요.' });
  }
  //else if (!checkSMSVerification(req)) return res.status(400).json({ message: '휴대폰 인증을 먼저 해주세요.' });
  //else if (phone !== smsVerification.phone) return res.status(400).json({ message: '입력한 휴대폰 번호와 인증된 휴대폰 번호가 다릅니다.' })
  try {
    let sql = `SELECT username FROM user WHERE name='${name}' AND phone='${phone}'`; // SQL 정의
    let [[username]] = await con.query(sql) // SQL 실행
    if (username){
      return res.status(200).json({ message: '아이디 찾기에 성공했습니다.', username });
    }
    else  return res.status(200).json({ message: '이름 혹은 전화번호가 틀립니다.'});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release(); // DB를 다 사용했으니 할당받은 자원을 해제함.
  }
});

//비밀 번호 초기화
//1. 아이디 이름 전화번호 입력하고 찾기 버튼을 누르면 전화번호 인증 화면으로 이동
//2. 인증이 완료되면 비밀번호 변경 화면으로 이동
//3. 백엔드에서 변경할 비밀 번호 값을 salt 값과 합쳐서 DB를 수정

var username0 = '';

//DB에서 사용자가 입력한 정보에 해당하는 값이 DB에 존재하는지 찾기
router.post('/id_check', async (req, res) => {
  const con = await db.getConnection(); // DB에 접근 가능한 커넥션 반환받음.
  const { username, name, phone } = req.body;
  
  username0 = username;

  if (!username || !name || !phone) {
    return res.status(400).json({ message: '아이디, 이름, 전화번호를 빠짐없이 입력해주세요.' });
  }
  try {
    let sql = `SELECT * FROM user WHERE username='${username}' AND name='${name}' AND phone='${phone}'`; // SQL 정의
    let [list] = await con.query(sql) // SQL 실행
    if (list.length){
      return res.status(200).json({ message: '해당 회원이 존재합니다. 전화번호 인증 페이지로 이동.'});
    }
    else  return res.status(200).json({ message: '해당하는 회원 정보가 없습니다. 아이디, 이름, 전화번호를 확인해주세요.'});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release(); // DB를 다 사용했으니 할당받은 자원을 해제함.
  }
});

//클라이언트에서 전화번호 인증 요청을 보냄 smsCtrl에서 처리
//client에서 전화번호 인증 페이지 보여주기

//비밀번호 변경
router.post('/password', async (req, res) => {
  const con = await db.getConnection(); // DB에 접근 가능한 커넥션 반환받음.
  const { password, password_check } = req.body;

  const salt = makeSalt();
  const encryptedPwd = encryptText(password, salt);

  if (password != password_check) {
    return res.status(400).json({ message: '비밀번호 확인이 일치하지 않습니다.' });
  }
  else if(!password || !password_check) return res.status(400).json({ message: '새 비밀번호를 입력해주세요' });
  else if (!checkSMSVerification(req)) return res.status(400).json({ message: '휴대폰 인증을 먼저 해주세요.' });
  try {
    //post /username의 username 값을 가져오는 방법????
    let sql = `UPDATE user SET salt='${salt}', password='${encryptedPwd}' WHERE username='${username0}'`; // SQL 정의
    let [list] = await con.query(sql) // SQL 실행
    return res.status(200).json({ message: '비밀 번호를 변경했습니다.'});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release(); // DB를 다 사용했으니 할당받은 자원을 해제함.
  }
});

module.exports = router;