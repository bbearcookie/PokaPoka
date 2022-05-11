const router = require('../config/express').router;
const { db } = require('../config/database');
const { isNull, getWhereClause, convertToMysqlTime, convertToMysqlStr } = require('../utils/common');
const { verifyLogin } = require('../utils/jwt');

// 모든 교환글 목록 조회 요청
router.get('/trade/list/all', async (req, res) => {
  const { groupId, memberId, albumId, state } = req.query;
  let { username } = req.query;

  const con = await db.getConnection();
  try {
    // 쿼리에 사용할 수 있는 형태로 변환
    username = convertToMysqlStr(username);

    let whereSqls = [];
    // 조회 조건에 groupId 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(groupId) && groupId !== 'all') whereSqls.push(`P.group_id=${groupId}`);
    // 조회 조건에 memberId 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(memberId) && memberId !== 'all') whereSqls.push(`P.member_id=${memberId}`);
    // 조회 조건에 albumId 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(albumId) && albumId !== 'all') whereSqls.push(`P.album_id=${albumId}`);
    // 조회 조건에 state 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(state) && state !== 'all') whereSqls.push(`T.state='${state}'`);
    // 조회 조건에 username 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(username)) whereSqls.push(`T.username LIKE '%${username}%'`);

    let sql = `
    SELECT T.trade_id, T.username, T.voucher_id, T.want_amount, T.state, T.regist_time,
    permanent, P.image_name, P.name, A.name as album_name
    FROM Trade as T
    INNER JOIN Voucher as V ON V.voucher_id = T.voucher_id
    INNER JOIN Photocard as P ON P.photocard_id = V.photocard_id
    INNER JOIN AlbumData as A ON A.album_id = P.album_id
    ${getWhereClause(whereSqls)}
    ORDER BY T.regist_time DESC`;

    // 조회한 게시글마다 반복
    let [trades] = await con.query(sql);
    trades = await Promise.all(trades.map(async (trade) => {

      // 원하는 포토카드의 목록을 가져옴
      let sql = `SELECT W.photocard_id, image_name, name
      FROM Wantcard as W
      INNER JOIN Photocard as P ON P.photocard_id = W.photocard_id
      WHERE W.trade_id=${trade.trade_id}`
      let [wantcards] = await con.query(sql);

      // 찜하기 정보를 가져옴
      sql = `SELECT username, trade_id FROM TradeFavorite WHERE trade_id=${trade.trade_id}`;
      let [favorites] = await con.query(sql);

      return { ...trade, wantcards, favorites };
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
    permanent, P.group_id, P.member_id, P.image_name, P.name, A.name as album_name
    FROM Trade as T
    INNER JOIN Voucher as V ON V.voucher_id = T.voucher_id
    INNER JOIN Photocard as P ON P.photocard_id = V.photocard_id
    INNER JOIN AlbumData as A ON A.album_id = P.album_id
    WHERE T.trade_id=${tradeId}`;
    let [[trade]] = await con.query(sql);

    // 교환글이 원하는 포토카드의 목록을 가져옴
    sql = `SELECT W.photocard_id, P.image_name, P.name, A.name as album_name
    FROM Wantcard as W
    INNER JOIN Photocard as P ON P.photocard_id = W.photocard_id
    INNER JOIN AlbumData as A ON A.album_id = P.album_id
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

    // 공통 조건 작성
    let whereSqls = [];
    whereSqls.push(`W.trade_id='${trade.trade_id}'`);
    whereSqls.push(`V.username='${user.username}'`);
    whereSqls.push(`V.permanent=${trade.permanent}`);

    // 임시 소유권이면 아직 거래 한 번도 안한 소유권만 조회하도록 WHERE 조건에 추가
    if (trade.permanent === 0) whereSqls.push(`V.state='initial'`);

    // 해당 교환글과 관련된 자신의 사용 가능한 모든 소유권 목록 조회
    sql = `
    SELECT V.voucher_id, P.image_name, P.name, A.name as album_name
    FROM Voucher as V
    INNER JOIN Wantcard as W ON W.photocard_id = V.photocard_id
    INNER JOIN Photocard as P ON P.photocard_id = V.photocard_id
    INNER JOIN AlbumData as A ON A.album_id = P.album_id
    ${getWhereClause(whereSqls)}
    ORDER BY V.voucher_id`
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

// 교환글 등록 요청
router.post('/trade/new', verifyLogin, async (req, res) => {
  const { permanent, haveVoucherId, wantPhotocards, wantAmount } = req.body;
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(400).json({ message: '로그인 상태가 아닙니다.' });

  // 유효성 검사
  if (!haveVoucherId) return res.status(400).json({ message: '사용하려는 소유권을 선택해주세요.' });
  if (isNull(wantPhotocards)) return res.status(400).json({ message: '받으려는 포토카드를 선택해주세요.' });
  if (wantPhotocards.length > 10) return res.status(400).json({ message: '받으려는 포토카드는 10개까지만 선택할 수 있습니다.' });
  if (!wantAmount) return res.status(400).json({ message: '받으려는 포토카드 개수를 입력해주세요.' });
  if (permanent === '0' && parseInt(wantAmount) > 1) return res.status(400).json({ message: '임시 소유권으로는 한 개의 포토카드만 받을 수 있습니다.' });

  const con = await db.getConnection();
  try {
    await con.beginTransaction();

    // 사용하려는 소유권 소유자 확인
    let sql = `SELECT username FROM Voucher WHERE voucher_id=${haveVoucherId}`;
    let [[voucher]] = await con.query(sql);
    if (!voucher) return res.status(400).json({ message: '사용하려는 소유권이 존재하지 않는 소유권입니다.' });
    if (voucher.username !== user.username) return res.status(400).json({ message: '사용하려는 소유권이 당신의 것이 아닙니다.' });

    // 이미 해당 소유권으로 등록된 거래 진행중인 교환글이 있다면 등록 불가능.
    sql = `
    SELECT trade_id FROM Trade
    WHERE voucher_id=${haveVoucherId} AND state='finding' AND username='${user.username}'`;
    let [[trade]] = await con.query(sql);
    if (trade) return res.status(400).json({ message: '해당 소유권으로 교환하려는 교환글을 이미 등록했습니다.' });

    // 교환글 등록
    sql = `INSERT INTO Trade (username, voucher_id, want_amount) VALUES (?, ?, ?)`;
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
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    await con.rollback();
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 교환글 수정 요청
router.put('/trade/:tradeId', verifyLogin, async (req, res) => {
  const { permanent, haveVoucherId, wantPhotocards, wantAmount } = req.body;
  let { tradeId } = req.params;
  tradeId = parseInt(tradeId);
  const { user } = req;

  // 유효성 검사
  if (!haveVoucherId) return res.status(400).json({ message: '사용하려는 소유권을 선택해주세요.' });
  if (isNull(wantPhotocards)) return res.status(400).json({ message: '받으려는 포토카드를 선택해주세요.' });
  if (wantPhotocards.length > 10) return res.status(400).json({ message: '받으려는 포토카드는 10개까지만 선택할 수 있습니다.' });
  if (!wantAmount) return res.status(400).json({ message: '받으려는 포토카드 개수를 입력해주세요.' });
  if (permanent === '0' && parseInt(wantAmount) > 1) return res.status(400).json({ message: '임시 소유권으로는 한 개의 포토카드만 받을 수 있습니다.' });

  // 로그인 상태 확인
  if (!user) return res.status(400).json({ message: '로그인 상태가 아닙니다.' });

  // 유효성 검사
  if (!tradeId) return res.status(400).json({ message: '수정하려는 교환글을 선택해주세요.' });

  const con = await db.getConnection();
  try {
    await con.beginTransaction();

    // 해당 교환글의 수정 조건 확인
    let sql = `SELECT trade_id, username, state FROM Trade WHERE trade_id=${tradeId}`;
    let [[trade]] = await con.query(sql);
    if (!trade) return res.status(400).json({ message: '존재하지 않는 교환글입니다.' });
    if (trade.username !== user.username) return res.status(400).json({ message: '권한이 없습니다.' });
    if (trade.state !== 'finding') return res.status(400).json({ message: '교환 완료된 교환글은 수정할 수 없습니다.' });

    // 사용하려는 소유권 소유자 확인
    sql = `SELECT username FROM Voucher WHERE voucher_id=${haveVoucherId}`;
    let [[voucher]] = await con.query(sql);
    if (!voucher) return res.status(400).json({ message: '사용하려는 소유권이 존재하지 않는 소유권입니다.' });
    if (voucher.username !== user.username) return res.status(400).json({ message: '사용하려는 소유권이 당신의 것이 아닙니다.' });

    // 이미 해당 소유권으로 등록된 거래 진행중인 교환글이 있다면 등록 불가능.
    sql = `
    SELECT trade_id FROM Trade
    WHERE voucher_id=${haveVoucherId} AND state='finding' AND username='${user.username}' AND trade_id!=${tradeId}`;
    [[trade]] = await con.query(sql);
    if (trade) return res.status(400).json({ message: '해당 소유권으로 교환하려는 교환글을 이미 등록했습니다.' });

    // 교환글이 원하는 기존의 포토카드 목록 제거
    sql = `DELETE FROM Wantcard WHERE trade_id=${tradeId}`;
    await con.execute(sql);

    // 교환글이 원하는 포토카드 목록 등록
    wantPhotocards.forEach(async (element) => {
      sql = `INSERT INTO WantCard (trade_id, photocard_id) VALUES (?, ?)`;
      await con.execute(sql, [tradeId, element]);
    });

    // 교환글 내용 수정
    sql = `UPDATE Trade SET voucher_id=${haveVoucherId}, want_amount=${wantAmount} WHERE trade_id=${tradeId}`;
    await con.execute(sql);

    await con.commit();
    return res.status(200).json({ message: '교환글이 수정되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    await con.rollback();
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 교환글 삭제 요청
router.delete('/trade/:tradeId', verifyLogin, async (req, res) => {
  const { tradeId } = req.params;
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(400).json({ message: '로그인 상태가 아닙니다.' });

  // 유효성 검사
  if (!tradeId) return res.status(400).json({ message: '교환 신청할 교환글을 선택해주세요.' });

  const con = await db.getConnection();
  try {
    // 해당 교환글 존재 유무 확인
    let sql = `SELECT trade_id, username, state FROM Trade WHERE trade_id=${tradeId}`;
    let [[trade]] = await con.query(sql);
    if (!trade) return res.status(400).json({ message: '교환 신청할 교환글을 선택해주세요.' });

    // 관리자이면 권한 비교할 필요 없음.
    if (user.role !== 'admin') {
      // 교환글 작성자와 삭제 요청자가 동일한 인물인지 확인
      if (trade.username !== user.username) {
        return res.status(400).json({ message: '삭제 권한이 없습니다.' });
      }
    }

    // 이미 교환이 완료된 교환글은 삭제 불가능
    if (trade.state !== 'finding') return res.status(400).json({ message: '이미 교환이 완료된 교환글은 삭제할 수 없습니다.' });

    // 교환글 삭제 처리
    sql = `DELETE FROM Trade WHERE trade_id=${tradeId}`;
    await con.execute(sql);
    return res.status(200).json({ message: '해당 교환글을 삭제했습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }
  
  return res.status(501).json({ message: 'end of line' });
});

// 해당 교환글에게 교환 신청
router.post('/trade/transaction/:tradeId', verifyLogin, async (req, res) => {
  const { tradeId } = req.params;
  const { useVouchers } = req.body;
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(400).json({ message: '로그인 상태가 아닙니다.' });

  // 유효성 검사
  if (!tradeId) return res.status(400).json({ message: '교환 신청할 교환글을 선택해주세요.' });
  if (isNull(useVouchers)) return res.status(400).json({ message: '사용할 포토카드 소유권을 선택해주세요.' });

  const con = await db.getConnection();
  try {
    await con.beginTransaction();

    // 교환글 정보 가져오기
    let sql = `
    SELECT T.trade_id, T.username, T.want_amount, V.voucher_id, V.state, V.permanent
    FROM Trade as T
    INNER JOIN Voucher as V ON V.voucher_id = T.voucher_id
    WHERE T.trade_id=${tradeId}`
    const [[trade]] = await con.query(sql);

    // 이미 교환 완료된 게시글에는 요청 불가능
    if (trade.state === 'finished') return res.status(400).json({ message: '이미 교환 완료된 교환글입니다.' });

    // 작성자와 교환 요청자는 같으면 안됨
    if (user.username === trade.username) return res.status(400).json({ message: '자신이 등록한 교환글에 교환 요청은 불가능합니다.' });

    // 소유권 개수 유효성 확인
    if (useVouchers.length < trade.want_amount) return res.status(400).json({ message: '교환할 소유권이 부족합니다. 더 선택해주세요.' });
    if (useVouchers.length > trade.want_amount) return res.status(400).json({ message: '교환할 소유권이 너무 많습니다. 교환하려는 소유권만 선택해주세요.' });

    // 임시 소유권인 경우 소유권 하나만 교환 가능
    if (trade.permanent === 0 && useVouchers.length > 1) return res.status(400).json({ message: '임시 소유권끼리의 교환은 교환하려는 소유권을 한 장만 선택할 수 있습니다.' });

    // 정식 소유권은 정식 소유권끼리, 임시 소유권은 임시 소유권끼리 교환 가능.
    // 임시 소유권이면 아직 거래 안한 소유권만 사용 가능.
    try {
      await Promise.all(useVouchers.map(async (voucherId) => {
        let sql = `SELECT voucher_id, username, state, permanent FROM Voucher WHERE voucher_id=${voucherId}`;
        let [[voucher]] = await con.query(sql);
  
        if (voucher.username !== user.username) throw new Error("당신의 소유권이 아닙니다.");
        if (trade.permanent !== voucher.permanent) throw new Error("정식 소유권은 정식 소유권끼리, 임시 소유권은 임시 소유권끼리 교환 가능합니다.");
        if (trade.permanent === 0 && voucher.state !== 'initial') throw new Error("임시 소유권으로는 한 번 거래했으면 정식 소유권이 되기까지 기다려야 합니다.");
      }));
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // TODO: 교환글에 포함된 voucher_id의 사용자를 요청자의 것으로 교체하고 state를 traded로 변경
    //       - TradeHistory 테이블에 provider가 recipient에게 voucher_id를 준다고 기록
    // TODO: useVouchers에 들어있는 소유권들을 교환글 작성자의 것으로 교체하고 state를 traded로 변경
    //       - TradeHistory 테이블에 provider가 recipient에게 voucher_id를 준다고 기록
    // TODO: 교환글의 state 필드를 finished로 변경하고 trade_time을 현재 시간으로 업데이트.

    // 교환글에 포함된 voucher_id의 사용자를 요청자의 것으로 교체하고 state를 traded로 변경
    sql = `
    UPDATE Voucher as V
    INNER JOIN Trade as T ON T.voucher_id = V.voucher_id
    SET V.username='${user.username}', V.state='traded'
    WHERE T.trade_id=${tradeId}`;
    await con.execute(sql);

    // 교환글 작성자가 요청자에게 voucher_id를 준다고 기록
    sql = `INSERT INTO TradeHistory (provider, recipient, voucher_id, trade_id) VALUES (?, ?, ?, ?)`;
    await con.execute(sql, [trade.username, user.username, trade.voucher_id, trade.trade_id]);

    // useVouchers에 들어있는 소유권들을 가지고 교환글 작성자에게 지급
    await Promise.all(useVouchers.map(async (voucherId) => {

      // 해당 소유권을 교환글 등록자의 것으로 교체하고 state를 traded로 변경
      let sql = `
      UPDATE Voucher
      SET username='${trade.username}', state='traded'
      WHERE voucher_id=${voucherId}`;
      await con.execute(sql);

      // 요청자가 교환글 작성자에게 해당 소유권을 준다고 기록
      sql = `INSERT INTO TradeHistory (provider, recipient, voucher_id, trade_id) VALUES (?, ?, ?, ?)`;
      await con.execute(sql, [user.username, trade.username, voucherId, trade.trade_id]);
    }));

    // 교환글의 state 필드를 finished로 변경하고 trade_time을 현재 시간으로 업데이트.
    sql = `
    UPDATE Trade
    SET state='finished', trade_time='${convertToMysqlTime(new Date())}'
    WHERE trade_id=${tradeId}`;
    await con.execute(sql);
    
    await con.commit();
    return res.status(200).json({ message: '교환 처리가 완료되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    await con.rollback();
    con.release();
  }
  
  return res.status(501).json({ message: 'end of line' });
});

// 해당 교환글에 찜하기 처리
router.post('/trade/favorite/:tradeId', verifyLogin, async (req, res) => {
  const { tradeId } = req.params;
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(400).json({ message: '로그인 상태가 아닙니다.' });

  // 유효성 검사
  if (!tradeId) return res.status(400).json({ message: '찜하기 할 교환글을 선택해주세요.' });

  const con = await db.getConnection();
  try {
    // 찜하기 정보 가져오기
    let sql = `SELECT favorite_id FROM TradeFavorite WHERE username='${user.username}' AND trade_id=${tradeId}`;
    let [[favorite]] = await con.query(sql);

    // 이미 찜했던 정보가 있으면 그 정보를 삭제
    if (favorite) {
      sql = `DELETE FROM TradeFavorite WHERE favorite_id=${favorite.favorite_id}`;
    // 찜하지 않았었으면 찜한 정보를 추가
    } else {
      sql = `
      INSERT INTO TradeFavorite (username, trade_id)
      VALUES ('${user.username}', ${tradeId})`;
    }
    await con.execute(sql);

    // 해당 게시글의 찜하기 정보를 가져옴
    sql = `SELECT username, trade_id FROM TradeFavorite WHERE trade_id=${tradeId}`;
    let [favorites] = await con.query(sql);

    return res.status(200).json({ message: '해당 교환글을 찜하기 처리 했습니다.', favorites });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }


  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;