const router = require('../config/express').router;
const { db } = require('../config/database');
const { isNull } = require('../utils/common');
const { verifyLogin } = require('../utils/jwt');

// 교환글 등록 요청
router.post('/trade/new', verifyLogin, async (req, res) => {
  const { permanent, haveVoucherId, wantPhotocards, wantAmount } = req.body;
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(400).json({ message: '로그인 상태가 아닙니다.' });

  // 유효성 검사
  if (!haveVoucherId) return res.status(400).json({ message: '사용하려는 소유권을 선택해주세요.' });
  if (isNull(wantPhotocards)) return res.status(400).json({ message: '받으려는 포토카드를 선택해주세요.' });
  if (!wantAmount) return res.status(400).json({ message: '받으려는 포토카드 개수를 입력해주세요.' });
  if (permanent === '0' && parseInt(wantAmount) > 1) return res.status(400).json({ message: '임시 소유권으로는 한 개의 포토카드만 받을 수 있습니다.' });

  const con = await db.getConnection();
  try {
    await con.beginTransaction();

    // -교환글 등록
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

// 모든 교환글 목록 조회 요청
router.get('/trade/list/all', async (req, res) => {
  const con = await db.getConnection();
  try {
    let sql = `SELECT trade_id, username, voucher_id, want_amount, state, regist_time FROM Trade`;
    const [trades] = await con.query(sql);
    return res.status(200).json({ message: '교환글 목록을 조회했습니다.', trades });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }
  
  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;