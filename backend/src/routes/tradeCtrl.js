const router = require('../config/express').router;
const { db } = require('../config/database');
const { isNull, getWhereClause, convertToMysqlTime, convertToMysqlStr, convertToMysqlArr } = require('../utils/common');
const { verifyLogin } = require('../utils/jwt');

// 모든 교환글 목록 조회 요청
router.get('/trade/list/all', async (req, res) => {
  const { groupId, memberId, albumId, state, limit } = req.query;
  let { username } = req.query;

  const con = await db.getConnection();
  try {
    // 쿼리에 사용할 수 있는 형태로 변환
    username = convertToMysqlStr(username);

    let whereSqls = [];
    let limitStr = '';
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

    // 조회 조건에 교환글 개수 제한 있으면 LIMIT 조건에 추가
    if (!isNull(limit)) limitStr = `LIMIT ${limit}`;

    let sql = `
    SELECT T.trade_id, T.username, T.voucher_id, T.want_amount, T.state, T.regist_time,
    permanent, P.image_name, P.name, A.name as album_name
    FROM Trade as T
    INNER JOIN Voucher as V ON V.voucher_id = T.voucher_id
    INNER JOIN Photocard as P ON P.photocard_id = V.photocard_id
    INNER JOIN AlbumData as A ON A.album_id = P.album_id
    ${getWhereClause(whereSqls)}
    ORDER BY T.regist_time DESC
    ${limitStr}`;

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

// 내가 찜한 교환글 목록 조회 요청
router.get('/trade/list/favorite', verifyLogin, async (req, res) => {
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(401).json({ message: '로그인 상태가 아닙니다.' });

  const con = await db.getConnection();
  try {
    let sql = `
    SELECT T.trade_id, T.username, T.voucher_id, T.want_amount, T.state, T.regist_time,
    permanent, P.image_name, P.name, A.name as album_name
    FROM Trade as T
    INNER JOIN Voucher as V ON V.voucher_id = T.voucher_id
    INNER JOIN Photocard as P ON P.photocard_id = V.photocard_id
    INNER JOIN AlbumData as A ON A.album_id = P.album_id
    WHERE T.trade_id IN (SELECT trade_id FROM TradeFavorite WHERE username='${user.username}')
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
    
    return res.status(200).json({ message: '찜한 교환글 목록을 조회했습니다.', trades });

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

    // 찜하기 정보를 가져옴
    sql = `SELECT username, trade_id FROM TradeFavorite WHERE trade_id=${trade.trade_id}`;
    let [favorites] = await con.query(sql);
    trade = { ...trade, favorites };

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
  if (!user) return res.status(401).json({ message: '로그인 상태가 아닙니다.' });

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

    // 교환글 존재 유무 검사
    if (!trade) return res.status(404).json({ message: '해당 교환글이 없습니다.' });

    // 공통 조건 작성
    let whereSqls = [];
    whereSqls.push(`W.trade_id='${trade.trade_id}'`);
    whereSqls.push(`V.username='${user.username}'`);
    whereSqls.push(`V.permanent=${trade.permanent}`);
    whereSqls.push(`V.state NOT IN ('requested', 'shipped')`);

    // 임시 소유권이면 아직 거래 한 번도 안한 소유권만 조회하도록 WHERE 조건에 추가
    if (trade.permanent === 0) whereSqls.push(`V.state='initial'`);

    // 해당 교환글과 관련된 자신의 사용 가능한 모든 소유권 목록 조회
    sql = `
    SELECT V.voucher_id, V.photocard_id, V.shipping, P.image_name, P.name, A.name as album_name
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
  if (!user) return res.status(401).json({ message: '로그인 상태가 아닙니다.' });

  // 유효성 검사
  if (!haveVoucherId) return res.status(400).json({ message: '사용하려는 소유권을 선택해주세요.' });
  if (isNull(wantPhotocards)) return res.status(400).json({ message: '받으려는 포토카드를 선택해주세요.' });
  if (wantPhotocards.length > 10) return res.status(400).json({ message: '받으려는 포토카드는 10개까지만 선택할 수 있습니다.' });
  if (!wantAmount) return res.status(400).json({ message: '받으려는 포토카드 개수를 입력해주세요.' });
  if (permanent === '0' && parseInt(wantAmount) > 1) return res.status(400).json({ message: '임시 소유권으로는 한 개의 포토카드만 받을 수 있습니다.' });
  if (wantAmount > wantPhotocards.length) return res.status(400).json({ message: '받으려는 포토카드 개수는 선택한 받으려는 포토카드의 종류보다 많을 수 없습니다.' });

  const con = await db.getConnection();
  try {
    await con.beginTransaction();

    // 사용하려는 소유권 정보 확인
    let sql = `SELECT photocard_id, username, state FROM Voucher WHERE voucher_id=${haveVoucherId}`;
    let [[voucher]] = await con.query(sql);
    if (!voucher) return res.status(400).json({ message: '사용하려는 소유권이 존재하지 않는 소유권입니다.' });
    if (voucher.username !== user.username) return res.status(400).json({ message: '사용하려는 소유권이 당신의 것이 아닙니다.' });
    if (voucher.state === 'requested' || voucher.state === 'shipped') return res.status(400).json({ message: '배송 처리된 소유권은 사용할 수 없습니다.' });
    if (wantPhotocards.includes(voucher.photocard_id)) return res.status(400).json({ message: '받으려는 포토카드는 사용하려는 소유권과 같은 종류일 수 없습니다.' });

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

  // 로그인 상태 확인
  if (!user) return res.status(401).json({ message: '로그인 상태가 아닙니다.' });

  // 유효성 검사
  if (!tradeId) return res.status(400).json({ message: '수정하려는 교환글을 선택해주세요.' });
  if (!haveVoucherId) return res.status(400).json({ message: '사용하려는 소유권을 선택해주세요.' });
  if (isNull(wantPhotocards)) return res.status(400).json({ message: '받으려는 포토카드를 선택해주세요.' });
  if (wantPhotocards.length > 10) return res.status(400).json({ message: '받으려는 포토카드는 10개까지만 선택할 수 있습니다.' });
  if (!wantAmount) return res.status(400).json({ message: '받으려는 포토카드 개수를 입력해주세요.' });
  if (wantAmount > wantPhotocards.length) return res.status(400).json({ message: '받으려는 포토카드 개수는 선택한 받으려는 포토카드의 종류보다 많을 수 없습니다.' });

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
    sql = `SELECT photocard_id, username, permanent, state FROM Voucher WHERE voucher_id=${haveVoucherId}`;
    let [[voucher]] = await con.query(sql);

    if (!voucher) return res.status(400).json({ message: '사용하려는 소유권이 존재하지 않는 소유권입니다.' });
    if (voucher.username !== user.username) return res.status(400).json({ message: '사용하려는 소유권이 당신의 것이 아닙니다.' });
    if (voucher.permanent === 0 && parseInt(wantAmount) > 1) return res.status(400).json({ message: '임시 소유권으로는 한 개의 포토카드만 받을 수 있습니다.' });
    if (voucher.state === 'requested' || voucher.state === 'shipped') return res.status(400).json({ message: '배송 처리된 소유권은 사용할 수 없습니다.' });
    if (wantPhotocards.includes(voucher.photocard_id)) return res.status(400).json({ message: '받으려는 포토카드는 사용하려는 소유권과 같은 종류일 수 없습니다.' });

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
  if (!user) return res.status(401).json({ message: '로그인 상태가 아닙니다.' });

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
  if (!user) return res.status(401).json({ message: '로그인 상태가 아닙니다.' });

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
      let redundancy_check = [];
      await Promise.all(useVouchers.map(async (voucherId) => {
        let sql = `SELECT voucher_id, photocard_id, username, state, permanent FROM Voucher WHERE voucher_id=${voucherId}`;
        let [[voucher]] = await con.query(sql);

        if (!redundancy_check.includes(voucher.photocard_id)) redundancy_check.push(voucher.photocard_id);
        else throw new Error("같은 종류의 포토카드는 여러 장을 동시에 사용할 수 없습니다.");
  
        if (voucher.username !== user.username) throw new Error("당신의 소유권이 아닙니다.");
        if (trade.permanent !== voucher.permanent) throw new Error("정식 소유권은 정식 소유권끼리, 임시 소유권은 임시 소유권끼리 교환 가능합니다.");
        if (trade.permanent === 0 && voucher.state !== 'initial') throw new Error("임시 소유권으로는 한 번 거래했으면 정식 소유권이 되기까지 기다려야 합니다.");
      }));
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // <교환 과정>
    // 1) 교환글에 포함된 voucher_id의 사용자를 요청자의 것으로 교체하고 state를 traded로 변경
    //       - TradeHistory 테이블에 provider가 recipient에게 voucher_id를 준다고 기록
    // 2) useVouchers에 들어있는 소유권들을 교환글 작성자의 것으로 교체하고 state를 traded로 변경
    //       - TradeHistory 테이블에 provider가 recipient에게 voucher_id를 준다고 기록
    // 3) 교환글의 state 필드를 finished로 변경하고 trade_time을 현재 시간으로 업데이트.

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

// 교환 탐색 기능
router.get('/trade/explore', async (req, res) => {
  let { haveVoucherId, wantPhotocardId } = req.query;
  haveVoucherId = parseInt(haveVoucherId);
  wantPhotocardId = parseInt(wantPhotocardId);

  // 유효성 검사
  if (!haveVoucherId) return res.status(400).json({ message: '사용하려는 소유권을 선택해주세요.' });
  if (!wantPhotocardId) return res.status(400).json({ message: '받으려는 포토카드를 선택해주세요.' });

  const con = await db.getConnection();
  try {
    let visited = []; // 같은 교환글 정보를 또 읽어오지 않도록 trade_id 방문 여부 기록.
    let traced_result = []; // 탐색 성공시 수행해야할 교환과 연관된 교환글들 trade_id

    // 요청자의 요청을 처리할 수 있는 교환글들을 찾아주는 함수.
    // 찾았으면 traced_result에 교환글들의 id가 들어가고, 못찾았으면 빈 배열로 저장된다.
    // havePhotocardId: 요청자가 가진 포토카드ID
    // destPhotocardId: 요청자가 최종적으로 받으려는 포토카드ID
    // traced: 재귀마다 방문했던 trade_id 순차적으로 기록
    const explore = async (havePhotocardId, destPhotocardId, traced) => {
      // console.log("-----------------------")
      // console.log(`solution: ${havePhotocardId}번 포토카드를 원하는 글 탐색`);
      // console.log(traced);

      // 교환 조건에 맞는 글들을 이미 찾았으면 더이상 재귀하지 않고 종료
      if (traced_result.length > 0) return;

      // 요청자의 포토카드를 원하는 모든 교환글들의 정보를 가져옴
      // [교환글 탐색 조건]
      // 교환글이 받으려는 포토카드가 하나여야 하고,
      // 진행중 상태인 교환글이어야하고,
      // 정식 소유권으로 등록한 교환글이어야 한다.
      sql = `
      SELECT T.trade_id, T.username, V.voucher_id, V.photocard_id
      FROM Trade as T
      INNER JOIN Voucher as V ON V.voucher_id=T.voucher_id
      WHERE T.trade_id IN (
        SELECT T.trade_id
        FROM Trade as T
        INNER JOIN Wantcard as W ON W.trade_id=T.trade_id
        WHERE T.state='finding' AND T.want_amount=1 AND V.permanent=1 AND W.photocard_id=${havePhotocardId}
        ORDER BY T.trade_time ASC
      )`;
      let [trades] = await con.query(sql);

      // 교환글마다 처음 방문하는 경우 반복
      for (let trade of trades) {
        if (!visited.includes(trade.trade_id)) {
          visited.push(trade.trade_id); // 현재 교환글을 방문했음을 기록

          // 해당 교환글이 가진 포토카드가 요청자가 최종적으로 받으려는 포토카드라면 조건에 알맞는 교환들을 찾은것임.
          if (trade.photocard_id === destPhotocardId) {
            traced_result = traced.concat({
              trade_id: trade.trade_id,
              want_photocard_id: havePhotocardId
            });
            return; // 탐색 성공했으니 탈출
          }

          // 해당 교환글의 have를 원하는 교환글 목록을 가져오도록 재귀 호출.
          await explore(
            trade.photocard_id,
            destPhotocardId,
            traced.concat({
              trade_id: trade.trade_id,
              want_photocard_id: havePhotocardId
            })
          );

        }
      }

      return;
    };
    
    // 요청자의 소유권 정보를 가져옴
    let sql = `
    SELECT V.voucher_id, V.photocard_id, V.username, P.name, P.image_name, A.name as album_name
    FROM Voucher as V
    INNER JOIN Photocard as P ON P.photocard_id = V.photocard_id
    INNER JOIN AlbumData as A ON A.album_id = P.album_id
    WHERE V.voucher_id=${haveVoucherId}`;
    let [[haveVoucher]] = await con.query(sql);

    // 소유권 검사
    if (!haveVoucher) return res.status(400).json({ message: '해당 소유권이 존재하지 않습니다.' });
    if (haveVoucher.photocard_id === wantPhotocardId) return res.status(400).json({ message: '같은 종류의 포토카드로 탐색할 수 없습니다.' });

    // 요청자의 요청을 처리할 수 있는 교환글들 탐색 (결과는 traced_result에 들어감)
    await explore(haveVoucher.photocard_id, wantPhotocardId, []);

    // 탐색 성공시
    if (traced_result.length > 0) {

      // 탐색 경로에 있는 교환글들의 상세 정보를 가져옴
      for (let i in traced_result) {

        // 교환글 상세 정보 가져옴
        let sql = `
        SELECT T.trade_id, V.voucher_id, T.username, T.regist_time,
        P.photocard_id, P.image_name, P.name, A.name as album_name
        FROM Trade as T
        INNER JOIN Voucher as V ON V.voucher_id = T.voucher_id
        INNER JOIN Photocard as P ON P.photocard_id = V.photocard_id
        INNER JOIN AlbumData as A ON A.album_id = P.album_id
        WHERE T.trade_id=${traced_result[i].trade_id}`;
        let [[trade]] = await con.query(sql);

        // 가져온 교환글 상세 정보를 탐색 경로에 추가
        // traced_result[i].detail = trade;
        traced_result[i] = { ...traced_result[i], ...trade }
      }
    }

    return res.status(200).json({ message: '교환 탐색 기능.', trades: traced_result, haveVoucher });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 탐색한 교환 경로를 가지고 처리 요청
router.post('/trade/explore', verifyLogin, async (req, res) => {
  const { haveVoucher, trades } = req.body;
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(401).json({ message: '로그인 상태가 아닙니다.' });

  // 유효성 검사
  if (!haveVoucher) return res.status(400).json({ message: '사용할 소유권을 선택해주세요.' });
  if (!trades) return res.status(400).json({ message: '매칭 가능한 교환이 있는지 먼저 탐색해주세요.' });
  if (trades.length === 0) return res.status(400).json({ message: '매칭되는 정보를 찾지 못했습니다.' });

  const con = await db.getConnection();
  try {
    await con.beginTransaction();

    // TODO:: <교환 과정>
    // 2) 요청자의 소유권을 trades[0] 작성자에게 주고, trades[마지막] 작성자의 소유권을 요청자에게 준다. Voucher 테이블에서 username을 바꾸고 state를 traded로 변경한다.
    //        (조건: trades[마지막]의 state가 'finding'인지를 체크한다.)
    //        (조건: 요청자의 소유권의 permanent와 trades[i]에 등록된 voucher의 permanent가 1인지를 체크한다.)
    //        (조건: trades[마지막]의 Wantcard 목록에 요청자의 소유권의 photocard_id를 포함하고 있는지를 체크한다.)
    //        - TradeHistory 테이블에 user.username -> trades[0].username 에게 voucher.voucher_id를 지급한다고 기록.
    //        - TradeHistory 테이블에 trades[마지막].username -> user.username 에게 trades[마지막].voucher_id를 지급한다고 기록.
    //        - 요청자의 소유권과 trades[마지막]의 소유권으로 등록된 교환글을 조회하여 state를 'finished'로 한다.
    // 1) trades를 0부터 trades.length - 1까지 순회하면서 반복한다.
    //        (조건: trades[i]의 state가 'finding'인지를 체크한다.)
    //        (조건: trades[i]에 등록된 voucher의 permanent가 1인지를 체크한다.)
    //        (조건: trades[i+1]의 Wantcard 목록에 trades[i].voucher_id 소유권의 photocard_id를 포함하고 있는지를 체크한다.)
    //        - trades[i].voucher_id 소유권을 trades[i+1].username에게 주고 state를 traded로 변경한다.
    //        - TradeHistory 테이블에 trades[i].username -> trades[i+1].username 에게 trades[i].voucher_id 를 지급한다고 기록.
    //        - trades[i].voucher_id 소유권으로 등록된 교환글을 조회하여 state를 'finished'로 한다.

    // 요청자의 소유권 정보 가져오기
    let sql = `
    SELECT V.voucher_id, V.photocard_id, V.username, V.permanent
    FROM Voucher as V
    WHERE V.voucher_id=${haveVoucher.voucher_id}`;
    let [[voucher]] = await con.query(sql);

    // 요청자의 소유권 검사
    if (!voucher) {
      await con.rollback();
      return res.status(400).json({ message: '해당 소유권의 정보를 가져오지 못했습니다.' });
    }
    if (voucher.username !== user.username) {
      await con.rollback();
      return res.status(400).json({ message: '당신의 소유권이 아닙니다.' });
    }
    if (voucher.permanent !== 1) {
      await con.rollback();
      return res.status(400).json({ message: '임시 소유권으로는 교환 탐색 기능으로 교환이 불가능합니다.' });
    }
    
    // trades[마지막]의 교환글 정보 가져오기
    sql = `
    SELECT T.trade_id, V.voucher_id, T.username, T.want_amount, T.state, V.permanent, V.photocard_id
    FROM Trade as T
    INNER JOIN Voucher as V ON V.voucher_id=T.voucher_id
    WHERE T.trade_id=${trades[trades.length - 1].trade_id}`;
    let [[finalTrade]] = await con.query(sql);
    
    if (!finalTrade) {
      await con.rollback();
      return res.status(400).json({ message: '교환글을 찾지 못했습니다.' });
    }
    if (finalTrade.state !== 'finding') {
      await con.rollback();
      return res.status(400).json({ message: '이미 교환이 완료된 교환글은 매칭 불가능합니다.' });
    }
    if (finalTrade.want_amount > 1) {
      await con.rollback();
      return res.status(400).json({ message: '받고자 하는 포토카드가 1개인 교환글만 매칭 가능합니다.' });
    }
    if (finalTrade.permanent != 1) {
      await con.rollback();
      return res.status(400).json({ message: '임시 소유권으로 등록한 교환글은 매칭 불가능합니다.' });
    }

    // 1) trades마다 다음 교환글로 교환 처리 ===========================================================
    // ===============================================================================================
    // ===============================================================================================
    for (let i = 0; i < trades.length - 1; i++) {

      // 현재 순회중인 교환글
      let sql = `
      SELECT T.trade_id, V.voucher_id, T.username, T.want_amount, T.state, V.permanent, V.photocard_id
      FROM Trade as T
      INNER JOIN Voucher as V ON V.voucher_id=T.voucher_id
      WHERE T.trade_id=${trades[i].trade_id}`;
      let [[trade]] = await con.query(sql);

      // 현재 순회중인 교환글의 바로 다음 교환글
      sql = `
      SELECT T.trade_id, V.voucher_id, T.username, T.want_amount, T.state, V.permanent, V.photocard_id
      FROM Trade as T
      INNER JOIN Voucher as V ON V.voucher_id=T.voucher_id
      WHERE T.trade_id=${trades[i+1].trade_id}`;
      let [[nextTrade]] = await con.query(sql);

      // 유효성 검사
      if (!trade || !nextTrade) {
        await con.rollback();
        return res.status(400).json({ message: '교환글을 찾지 못했습니다.' });
      }
      if (trade.state !== 'finding' || nextTrade.state !== 'finding') {
        await con.rollback();
        return res.status(400).json({ message: '이미 완료된 교환글이 있어서 교환 불가능합니다.' });
      }
      if (trade.want_amount > 1 || nextTrade.want_amount > 1) {
        await con.rollback();
        return res.status(400).json({ message: '받고자 하는 포토카드가 1개인 교환글만 매칭 가능합니다.' });
      }
      if (trade.permanent != 1 || nextTrade.permanent != 1) {
        await con.rollback();
        return res.status(400).json({ message: '임시 소유권으로 등록한 교환글은 매칭 불가능합니다.' });
      }

      // 바로 다음 교환글이 원하는 포토카드 목록에 trade의 포토카드가 들어있는지 확인
      sql = `
      SELECT photocard_id
      FROM Wantcard
      WHERE trade_id=${nextTrade.trade_id}`;
      let [wantcards] = await con.query(sql);
      nextTrade.wantcards = wantcards.map((element) => (element.photocard_id)); // photocard_id만 추출해서 배열로 만듬
      if (!nextTrade.wantcards.includes(trade.photocard_id)) {
        await con.rollback();
        return res.status(400).json({ message: '서버 문제로 원하지 않는 포토카드로 매칭된 교환글이 있어서 처리 불가능합니다.' });
      }

      // trade[i]의 소유권을 trades[i+1] 작성자에게 준다.
      sql = `
      UPDATE Voucher
      SET username='${nextTrade.username}', state='traded'
      WHERE voucher_id=${trade.voucher_id}`;
      await con.execute(sql);

      // 교환글 완료 처리
      sql = `
      UPDATE Trade
      SET state='finished'
      WHERE voucher_id=${trade.voucher_id}`;
      await con.execute(sql);

      // 교환 내역 기록 (trade[i] 작성자 -> trades[i+1] 작성자)
      sql = `INSERT INTO TradeHistory (provider, recipient, voucher_id)
      VALUES ('${trade.username}', '${nextTrade.username}', ${trade.voucher_id})`;
      await con.execute(sql);
    }

    // 2) 요청자의 소유권 ==> trades[0] 작성자,
    //    trades[마지막] 작성자의 소유권 ==> 요청자
    //    교환 처리
    // ===============================================================================================
    // ===============================================================================================
    // trades[0]의 교환글이 원하는 포토카드 목록에 요청자의 포토카드가 들어있는지 확인
    sql = `
    SELECT photocard_id
    FROM Wantcard
    WHERE trade_id=${trades[0].trade_id}`;
    let [wantcards] = await con.query(sql);
    wantcards = wantcards.map((element) => (element.photocard_id)); // photocard_id만 추출해서 배열로 만듬
    if (!wantcards.includes(voucher.photocard_id)) {
      await con.rollback();
      return res.status(400).json({ message: '당신의 포토카드를 원하지 않는 교환글 매칭되어서 처리 불가능합니다.' });
    }

    // 요청자의 소유권을 trades[0] 작성자에게 준다.
    sql = `
    UPDATE Voucher
    SET username='${trades[0].username}', state='traded'
    WHERE voucher_id=${voucher.voucher_id}`;
    await con.execute(sql);

    // trades[마지막] 작성자의 소유권을 요청자에게 준다.
    sql = `
    UPDATE Voucher
    SET username='${user.username}', state='traded'
    WHERE voucher_id=${finalTrade.voucher_id}`;
    await con.execute(sql);

    // 요청자의 소유권으로 등록된 교환글이 있다면 완료 처리
    sql = `
    UPDATE Trade
    SET state='finished'
    WHERE voucher_id=${voucher.voucher_id}`;
    await con.execute(sql);

    // trades[마지막] 교환글 완료 처리
    sql = `
    UPDATE Trade
    SET state='finished'
    WHERE voucher_id=${finalTrade.voucher_id}`;
    await con.execute(sql);

    // 교환 내역 기록 (요청자 -> trades[0] 작성자)
    sql = `INSERT INTO TradeHistory (provider, recipient, voucher_id)
    VALUES ('${user.username}', '${trades[0].username}', ${voucher.voucher_id})`;
    await con.execute(sql);

    // 교환 내역 기록 (trades[마지막] 작성자 -> 요청자)
    sql = `INSERT INTO TradeHistory (provider, recipient, voucher_id)
    VALUES ('${finalTrade.username}', '${user.username}', ${finalTrade.voucher_id})`;
    await con.execute(sql);

    await con.commit();
    return res.status(200).json({ message: '매칭된 교환 처리에 성공했습니다.' });
  } catch (err) {
    console.error(err);
    await con.rollback();
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 해당 교환글에 찜하기 처리
router.post('/trade/favorite/:tradeId', verifyLogin, async (req, res) => {
  const { tradeId } = req.params;
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(401).json({ message: '로그인 상태가 아닙니다.' });

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

// 사용자가 보냈던 포토카드 교환 내역 조회
router.get('/trade/history/provision', verifyLogin, async (req, res) => {
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(401).json({ message: '로그인 상태가 아닙니다.' });

  const con = await db.getConnection();
  try {
    let sql = `
    SELECT H.history_id, H.recipient, H.trade_time,
    V.voucher_id, P.name, P.image_name, A.name as album_name
    FROM TradeHistory as H
    INNER JOIN Voucher as V ON V.voucher_id=H.voucher_id
    INNER JOIN Photocard as P ON P.photocard_id=V.photocard_id
    INNER JOIN AlbumData as A ON A.album_id=P.album_id
    WHERE H.provider='${user.username}'
    ORDER BY H.trade_time DESC`
    let [histories] = await con.query(sql);
    
    return res.status(200).json({ message: '당신이 보냈던 포토카드 교환 내역 조회를 성공했습니다.', histories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 사용자가 받았던 포토카드 교환 내역 조회
router.get('/trade/history/receipt', verifyLogin, async (req, res) => {
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(401).json({ message: '로그인 상태가 아닙니다.' });

  const con = await db.getConnection();
  try {
    let sql = `
    SELECT H.history_id, H.provider, H.trade_time,
    V.voucher_id, P.name, P.image_name, A.name as album_name
    FROM TradeHistory as H
    INNER JOIN Voucher as V ON V.voucher_id=H.voucher_id
    INNER JOIN Photocard as P ON P.photocard_id=V.photocard_id
    INNER JOIN AlbumData as A ON A.album_id=P.album_id
    WHERE H.recipient='${user.username}'
    ORDER BY H.trade_time DESC`
    let [histories] = await con.query(sql);
    
    return res.status(200).json({ message: '당신이 받았던 포토카드 교환 내역 조회를 성공했습니다.', histories });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;