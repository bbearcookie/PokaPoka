const router = require('../config/express').router;
const { db } = require('../config/database');
const { checkSMSVerification } = require('../utils/sns');

//const verified = require('./smsCtrl');

//import smsVerification from './smsCtrl'

router.get('/', async (req, res) => {
  res.status(200).send("<h1>아이디 찾기 페이지입니다.</h1>");
});


// DB SELECT
router.get('/db2', async (req, res) => {
  const con = await db.getConnection(); // DB에 접근 가능한 커넥션 반환받음.
  const { name, phone } = req.query;

  if (!name || !phone) {
    return res.status(400).json({ message: '이름과 전화번호를 입력해주세요.' });
  }
  else if (!checkSMSVerification(req)) return res.status(400).json({ message: '휴대폰 인증을 먼저 해주세요.' });
  else if (phone !== smsVerification.phone) return res.status(400).json({ message: '입력한 휴대폰 번호와 인증된 휴대폰 번호가 다릅니다.' })
  try {
    let sql = `SELECT username FROM user WHERE name='${name}' AND phone='${phone}'`; // SQL 정의
    let [list] = await con.query(sql) // SQL 실행
    if (list.length){
      return res.status(200).json({ message: 'DB를 조회했습니다.', list });
    }
    else  return res.status(200).json({ message: '아이디 혹은 전화번호가 틀립니다.'});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release(); // DB를 다 사용했으니 할당받은 자원을 해제함.
  }
});



module.exports = router;