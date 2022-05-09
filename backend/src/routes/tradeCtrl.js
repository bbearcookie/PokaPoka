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

    // 교환글 등록
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
      let [wantcards] = await con.query(sql);

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

// 특정 교환글 상세 조회 요청
router.get('/trade/detail/:tradeId', async (req, res) => {
  const { tradeId } = req.params;

  // 유효성 검사
  if (!tradeId) return res.status(400).json({ message: '조회할 교환글을 선택해주세요.' });

  const con = await db.getConnection();
  try {

    // 교환글 상세 정보 가져옴
    let sql = `
    SELECT T.trade_id, T.username, T.voucher_id, T.want_amount, T.state, T.regist_time,
    permanent, P.image_name, P.name, A.name as album_name
    FROM Trade as T
    INNER JOIN Voucher as V ON V.voucher_id = T.voucher_id
    INNER JOIN Photocard as P ON P.photocard_id = V.photocard_id
    INNER JOIN AlbumData as A ON A.album_id = P.album_id
    WHERE T.trade_id=${tradeId}`;
    let [[trade]] = await con.query(sql);

    // 교환글이 원하는 포토카드의 목록을 가져옴
    sql = `SELECT W.photocard_id, image_name, name
    FROM Wantcard as W
    INNER JOIN Photocard as P ON P.photocard_id = W.photocard_id
    WHERE W.trade_id=${trade.trade_id}`;
    let [wantcards] = await con.query(sql);

    trade = { ...trade, wantcards };

    return res.status(200).json({ message: '교환글을 상세 조회했습니다.', trade });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 특정 교환글이 원하는 포토카드 중에서 자신이 가지고 있는 소유권 목록 조회
router.get('/trade/wantcard/mine/:tradeId', verifyLogin, async (req, res) => {
  const { tradeId } = req.params;
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(400).json({ message: '로그인 상태가 아닙니다.' });

  // 유효성 검사
  if (!tradeId) return res.status(400).json({ message: '조회할 교환글을 선택해주세요.' });
  
  const con = await db.getConnection();
  try {
    // let sql = `SELECT *
    // FROM Voucher as V
    // INNER JOIN Wantcard as W ON W.photocard_id = 
    // WHERE V.username='${user.username}' AND W.trade_id=${tradeId}`

    // TODO: 임시 소유권으로 등록된 것인지, 정식 소유권으로 등록된 것인지에 따라 조회 조건이 다름.

    // 교환글 정보 가져오기
    let sql = `
    SELECT T.trade_id, V.voucher_id, V.state, V.permanent
    FROM Trade as T
    INNER JOIN Voucher as V ON V.voucher_id = T.voucher_id
    WHERE T.trade_id=${tradeId}`
    const [[trade]] = await con.query(sql);
    console.log(trade);

    // 교환글 존재 유무 검사
    if (!trade) return res.status(404).json({ message: '해당 교환글이 없습니다.' });

    let whereSqls = [];
    whereSqls.push(`W.trade_id='${trade.trade_id}'`);
    whereSqls.push(`V.username='${user.username}'`);
    whereSqls.push(`V.permanent=${trade.permanent}`);

    // 임시 소유권이면 아직 거래 한 번도 안한 소유권만 조회하도록 WHERE 조건에 추가
    if (trade.permanent === 0) whereSqls.push(`V.state='${initial}'`);

    sql = `
    SELECT V.voucher_id, P.image_name, P.name, A.name as album_name
    FROM Voucher as V
    INNER JOIN Wantcard as W ON W.photocard_id = V.photocard_id
    INNER JOIN Photocard as P ON P.photocard_id = V.photocard_id
    INNER JOIN AlbumData as A ON A.album_id = P.album_id
    ${getWhereClause(whereSqls)}`
    let [vouchers] = await con.query(sql);

    return res.status(200).json({ message: '사용 가능한 소유권을 조회했습니다.', vouchers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }
  
  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;