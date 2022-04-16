const router = require('../config/express').router;
const { db } = require('../config/database');

// DB SELECT
router.get('/username', async (req, res) => {
  const con = await db.getConnection(); // DB에 접근 가능한 커넥션 반환받음.
  const { name, phone } = req.query;

  if (!name || !phone) {
    return res.status(400).json({ message: '이름과 전화번호를 입력해주세요.' });
  }
  try {
    let sql = `SELECT username FROM user WHERE name='${name}' AND phone='${phone}'`; // SQL 정의
    let [[user]] = await con.query(sql) // SQL 실행

    if (!user) return res.status(400).json({ message: '이름 혹은 전화번호가 틀립니다.'});
    return res.status(200).json({ message: `당신의 아이디는 ${user.username} 입니다.`, username: user.username });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release(); // DB를 다 사용했으니 할당받은 자원을 해제함.
  }
});

module.exports = router;