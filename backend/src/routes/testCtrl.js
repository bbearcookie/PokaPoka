const router = require('../config/express').router;
const { db } = require('../config/database');

router.get('/', async (req, res) => {
  res.status(200).send("<h1>테스트용 페이지입니다.</h1>");
});

// DB SELECT 테스트
router.get('/db', async (req, res) => {
  const con = await db.getConnection(); // DB에 접근 가능한 커넥션 반환받음.
  try {
    let sql = `SELECT * FROM test`; // SQL 정의
    let [data_list] = await con.query(sql) // SQL 실행
    return res.status(200).json({ message: 'DB를 조회했습니다.', data_list });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release(); // DB를 다 사용했으니 할당받은 자원을 해제함.
  }
});

// DB INSERT 테스트
router.post('/db', async (req, res) => {
  const { text } = req.body;

  if (text) {
    const con = await db.getConnection(); // DB에 접근 가능한 커넥션 반환받음.
    try {
      let sql = `INSERT INTO test(text) VALUES ('${text}')`; // SQL 정의
      await con.execute(sql); // SQL 실행
      return res.status(200).json({ message: 'DB에 데이터를 등록했습니다.', text });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
      con.release(); // DB를 다 사용했으니 할당받은 자원을 해제함.
    }
  } else {
    return res.status(400).json({ message: 'text 값을 안보내셨어요.' });
  }
});

module.exports = router;