const router = require('../config/express').router;
const { db } = require('../config/database');

//조회
//교환글 목록 조회
router.get('/list', async (req, res) => {
    const con = await db.getConnection();
    try {
      let sql = `SELECT trade_id, username, voucher_id, want_amount, state, regist_time, trade_time FROM Trade`;
      let [trade] = await con.query(sql);
      return res.status(200).json({ message: '교환글 목록 조회에 성공했습니다.', trade });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
      con.release();
    }
  
    return res.status(501).json({ message: 'end of line' });
});

module.exports = router;