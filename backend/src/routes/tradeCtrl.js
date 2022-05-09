const router = require('../config/express').router;
const { db } = require('../config/database');
const { isNull, getWhereClause } = require('../utils/common');
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
  const { groupId, memberId, albumId } = req.query;

  const con = await db.getConnection();
  try {
    let whereSqls = [];

    // 조회 조건에 groupId 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(groupId) && groupId !== 'all') whereSqls.push(`P.group_id=${groupId}`);
    // 조회 조건에 memberId 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(memberId) && memberId !== 'all') whereSqls.push(`P.member_id=${memberId}`);
    // 조회 조건에 albumId 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(albumId) && albumId !== 'all') whereSqls.push(`P.album_id=${albumId}`);

    let sql = `
    SELECT T.trade_id, T.username, T.voucher_id, T.want_amount, T.state, T.regist_time,
    permanent, P.image_name, P.name, A.name as album_name
    FROM Trade as T
    INNER JOIN Voucher as V ON V.voucher_id = T.voucher_id
    INNER JOIN Photocard as P ON P.photocard_id = V.photocard_id
    INNER JOIN AlbumData as A ON A.album_id = P.album_id
    ${getWhereClause(whereSqls)}
    ORDER BY T.regist_time DESC`;

    // 조회한 게시글마다 원하는 포토카드의 목록을 가져옴
    let [trades] = await con.query(sql);
    trades = await Promise.all(trades.map(async (trade) => {
      let sql = `SELECT W.photocard_id, image_name, name
      FROM Wantcard as W
      INNER JOIN Photocard as P ON P.photocard_id = W.photocard_id
      WHERE W.trade_id=${trade.trade_id}`
      const [wantcards] = await con.query(sql);

      return { ...trade, wantcards };
    }));

    return res.status(200).json({ message: '교환글 목록을 조회했습니다.', trades });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }
  
  return res.status(501).json({ message: 'end of line' });
});

// 자신의 교환글 목록 조회 요청
router.get('/trade/list/mine', verifyLogin, async (req, res) => {

  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;