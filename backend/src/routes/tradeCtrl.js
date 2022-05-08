const router = require('../config/express').router;
const { db } = require('../config/database');
const { verifyLogin } = require('../utils/jwt');

// 교환글 등록 요청
router.post('/trade/new', verifyLogin, async (req, res) => {
  const { haveVoucherId, wantPhotocards, wantAmount } = req.body;
  const { user } = req;

  console.log(req.body);

  // 로그인 상태 확인
  if (!user) return res.status(400).json({ message: '로그인 상태가 아닙니다.' });

  const con = await db.getConnection();
  try {
    await con.beginTransaction();

    // TODO: 교환글 등록
    let sql = `INSERT INTO Trade (username, voucher_id, want_amount) VALUES (?, ?, ?)`;
    let [result] = await con.execute(sql, [user.username, haveVoucherId, wantAmount]);

    // 교환글이 원하는 포토카드 목록 등록
    wantPhotocards.forEach(async (element) => {
      sql = `INSERT INTO WantCard (trade_id, photocard_id) VALUES (?, ?)`;
      await con.execute(sql, [result.insertId, element]);
    });

    await con.commit();
    return res.status(200).json({ message: '교환글을 등록했습니다.' });
  } catch (err) {
    console.error(err);
    con.rollback();
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;