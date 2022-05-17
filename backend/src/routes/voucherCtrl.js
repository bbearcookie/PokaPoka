const router = require('../config/express').router;
const path = require('path');
const { db } = require('../config/database');
const fs = require('fs').promises;
const { getTimestampFilename, voucherImageUpload, VOUCHER_IMAGE_DIR } = require('../config/multer');
const { verifyLogin, isAdmin } = require('../utils/jwt');
const { isNull, getWhereClause } = require('../utils/common');

// 사용자 본인이 소유한 포토카드 소유권 목록 조회
router.get('/list/mine', verifyLogin, async (req, res) => {
  const { permanent, state, groupId, memberId } = req.query; // WHERE 필터링 조건으로 사용될 값들
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(401).json({ message: '로그인 상태가 아닙니다.' });

  const con = await db.getConnection();
  try {
    let whereSqls = []; // WHERE 절에 들어갈 조건문 배열. 조건 작성후 getWhereClause 호출하면 WHERE절에 알맞는 문자열로 반환됨
    whereSqls.push(`username='${user.username}'`);

    // 소유권 조회 조건에 permanent 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(permanent)) whereSqls.push(`permanent='${permanent}'`);

    // 소유권 조회 조건에 state 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(state)) whereSqls.push(`state='${state}'`);

    // 소유권 조회 조건에 특정 그룹과 멤버에 대한 필터링 조건이 있을 경우 WHERE 조건에 추가
    if (!isNull(groupId) && !isNull(memberId)) {
      // 모든 그룹의 모든 멤버에 대한 소유권 목록 조회
      if (groupId === 'all' && memberId === 'all') {
        // 특별한 WHERE 조건이 필요하지 않음.
      // 특정 그룹의 모든 멤버에 대한 소유권 목록 조회
      } else if (memberId === 'all') {
        whereSqls.push(`P.group_id=${groupId}`);
      // 그 외에 특정 멤버에 대한 소유권 목록 조회
      } else {
        whereSqls.push(`P.member_id=${memberId}`);
      }
    }

    // 목록 조회
    let sql = `
    SELECT voucher_id, state, permanent, shipping, P.photocard_id, P.group_id, P.member_id, P.album_id, P.image_name, P.name, A.name AS album_name
    FROM Voucher as V
    INNER JOIN Photocard as P ON V.photocard_id = P.photocard_id
    INNER JOIN AlbumData as A ON P.album_id = A.album_id
    ${getWhereClause(whereSqls)}
    ORDER BY P.group_id, voucher_id`;
    let [vouchers] = await con.query(sql);

    return res.status(200).json({ message: '포토카드 소유권 목록 조회에 성공했습니다.', vouchers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 사용자 본인의 소유권 요청 목록 조회
router.get('/request/list/mine', verifyLogin, async (req, res) => {
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(401).json({ message: '로그인 상태가 아닙니다.' });

  const con = await db.getConnection();
  try {
    let sql = `SELECT REQ.request_id, REQ.username, REQ.photocard_id, REQ.delivery, REQ.tracking_number, REQ.state, REQ.regist_time, P.name
    FROM VoucherRequest as REQ
    INNER JOIN Photocard as P ON P.photocard_id=REQ.Photocard_id
    WHERE username='${user.username}'
    ORDER BY regist_time DESC`;
    let [requests] = await con.query(sql);
    return res.status(200).json({ message: '포토카드 소유권 요청 목록 조회에 성공했습니다.', requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 모든 포토카드 소유권 요청 목록 조회 (관리자 전용)
router.get('/request/list/all', verifyLogin, async (req, res) => {
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  const con = await db.getConnection();
  try {
    let sql = `SELECT REQ.request_id, REQ.username, REQ.photocard_id, REQ.delivery, REQ.tracking_number, REQ.state, REQ.regist_time, P.name
    FROM VoucherRequest as REQ
    INNER JOIN Photocard as P ON P.photocard_id=REQ.Photocard_id
    ORDER BY regist_time DESC`;
    let [requests] = await con.query(sql);
    return res.status(200).json({ message: '포토카드 소유권 요청 목록 조회에 성공했습니다.', requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 포토카드 소유권 요청 상세 조회
router.get('/request/detail/:requestId', async (req, res) => {
  const { requestId } = req.params;

  // 유효성 검사
  if (!requestId) return res.status(400).json({ message: '요청글 번호를 입력해주세요.' });

  const con = await db.getConnection();
  try {
    // 포토카드 소유권 요청 조회
    let sql = `SELECT request_id, username, photocard_id, delivery, tracking_number, state, regist_time, image_name 
    FROM VoucherRequest
    WHERE request_id=${requestId}`;
    let [[request]] = await con.query(sql);

    // 포토카드 내용 조회
    sql = `SELECT photocard_id, group_id, member_id, album_id, name, image_name
    FROM Photocard WHERE photocard_id=${request.photocard_id}`;
    let [[photocard]] = await con.query(sql);

    return res.status(200).json({ message: '포토카드 소유권 발급 요청 상세 조회에 성공했습니다.', request, photocard });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});


// 포토카드 소유권 발급 요청
router.post('/request', voucherImageUpload.single('image'), verifyLogin, async (req, res) => {
  const { delivery, trackingNumber, photocardId } = req.body;
  const { user, file } = req;

  // 유효성 검사 실패시 다운 받은 임시 이미지 파일을 삭제하는 함수
  function removeTempFile() {
    if (file) {
      try { fs.rm(file.path); }
      catch (err) { console.error(err); }
    }
  }

  // 로그인 상태 검사
  if (!user) {
    removeTempFile();
    return res.status(401).json({ message: '로그인 상태가 아닙니다.' });
  }

  // 유효성 검사
  if (!file) return res.status(400).json({ message: '이미지 파일을 업로드해주세요.' });
  if (!delivery) {
    removeTempFile();
    return res.status(400).json({ message: '택배사를 입력해주세요.' });
  }
  if (!trackingNumber){
    removeTempFile();
    return res.status(400).json({ message: '운송장 번호를 입력해주세요.' });
  }
  if (!photocardId) {
    removeTempFile();
    return res.status(400).json({ message: '발급 받고자 하는 포토카드를 선택해주세요.' });
  }

  const con = await db.getConnection();
  try {

    // DB에 소유권 요청 정보 저장
    let sql = `INSERT INTO VoucherRequest (username, photocard_id, delivery, tracking_number) VALUES (?, ?, ?, ?)`;
    let [result] = await con.execute(sql, [user.username, photocardId, delivery, trackingNumber]);

    // 임시로 받은 이미지 파일의 이름을 실제로 저장할 이름으로 변경
    let filename = "";
    if (file) {
      filename = getTimestampFilename(result.insertId, file.mimetype);
      try { fs.rename(file.path, path.join(file.destination, filename)); }
      catch (err) { console.error(err); }
    }
    sql = `UPDATE VoucherRequest SET image_name = '${filename}' WHERE request_id = ${result.insertId}`;
    await con.execute(sql);

    return res.status(200).json({ message: '관리자에게 포토카드 소유권 발급을 요청했습니다.' });
  } catch (err) {
    console.error(err);
    removeTempFile();
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 포토카드 소유권 요청 삭제
router.delete('/request/:requestId', verifyLogin, async (req, res) => {
  const { requestId } = req.params;
  const { user, accessToken } = req;

  // 로그인 상태 검사
  if (!user) return res.status(401).json({ message: '로그인 상태가 아닙니다.' });

  const con = await db.getConnection();
  try {
    // 소유권 요청 존재 유무 확인
    let sql = `SELECT request_id, username, state, image_name FROM VoucherRequest WHERE request_id=${requestId}`;
    let [[request]] = await con.query(sql);
    if (!request) return res.status(404).json({ message: '삭제하려는 소유권 요청이 없습니다.' });
    if (request.state !== 'waiting') return res.status(400).json({ message: '발급 완료된 소유권 요청은 삭제할 수 없습니다.' });

    // 관리자이거나 해당 소유권을 등록한 것이 자신인 경우에만 삭제 가능
    if (isAdmin(accessToken) || request.username === user.username) {

      // DB에서 소유권 요청 삭제
      sql = `DELETE FROM VoucherRequest WHERE request_id=${requestId}`;
      await con.execute(sql);

      // 이미지 파일 삭제
      try { fs.rm(path.join(VOUCHER_IMAGE_DIR, request.image_name)); }
      catch (err) { console.error(err); }

      return res.status(200).json({ message: '소유권 요청을 삭제했습니다.' });

    } else return res.status(403).json({ message: '권한이 없습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 포토카드 소유권 발급 목록 조회
router.get('/provision/list/all', verifyLogin, async (req, res) => {
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  const con = await db.getConnection();
  try {
    let sql = `
    SELECT provision_id, P.voucher_id, provider, recipient, provide_time, P.permanent, PHOTO.name
    FROM VoucherProvision as P
    INNER JOIN Voucher as V ON P.voucher_id = V.voucher_id
    INNER JOIN Photocard as PHOTO ON V.photocard_id = PHOTO.photocard_id
    ORDER BY P.provide_time DESC`;
    let [provisions] = await con.query(sql);

    return res.status(200).json({ message: '포토카드 소유권 발급 목록을 조회했습니다.', provisions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }


  return res.status(501).json({ message: 'end of line' });
});

// 포토카드 소유권 발급
router.post('/provision/new', verifyLogin, async (req, res) => {
  const { recipient, permanent, photocardId } = req.body;
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  // 유효성 검사
  if (!recipient) return res.status(400).json({ message: '발급 대상의 아이디를 입력해주세요.' });
  if (!permanent) return res.status(400).json({ message: '임시 소유권 여부를 입력해주세요.' });
  if (!photocardId) return res.status(400).json({ message: '발급하려는 포토카드를 선택해주세요.' });

  const con = await db.getConnection();
  try {
    await con.beginTransaction(); // 여러 테이블에 대한 삽입, 수정 작업은 동시에 이뤄져야 하므로 트랜잭션으로 묶음 처리

    // 사용자 존재 여부 확인
    let sql = `SELECT username from User where username='${recipient}'`;
    let [[user]] = await con.query(sql);
    if (!user) return res.status(400).json({ message: '발급 대상이 가입되지 않은 사용자입니다.' });

    // 포토카드 존재 여부 확인
    sql = `SELECT photocard_id from Photocard where photocard_id='${photocardId}'`;
    let [[photocard]] = await con.query(sql);
    if (!photocard) return res.status(400).json({ message: '선택한 포토카드는 데이터에 없습니다.' });

    // 해당 사용자의 소유권 추가
    sql = `INSERT INTO Voucher (photocard_id, username, permanent) VALUES (?, ?, ?)`;
    let [result] = await con.execute(sql, [photocardId, recipient, permanent]);

    // 발급 내역 추가
    sql = `INSERT INTO VoucherProvision (voucher_id, provider, recipient, permanent) VALUES (?, ?, ?, ?)`;
    await con.execute(sql, [result.insertId, req.user.username, recipient, permanent]);

    await con.commit(); // 수정된 DB 내용 반영
    return res.status(200).json({ message: '해당 사용자에게 포토카드 소유권을 발급했습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    await con.rollback();
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 기존의 포토카드 소유권 요청 정보를 가지고 임시 소유권 발급
router.post('/provision/request', verifyLogin, async (req, res) => {
  const { requestId } = req.body;
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  const con = await db.getConnection();
  try {
    await con.beginTransaction(); // 여러 테이블에 대한 삽입, 수정 작업은 동시에 이뤄져야 하므로 트랜잭션으로 묶음 처리

    // 포토카드 요청 존재 여부 확인
    sql = `SELECT username, photocard_id, state from VoucherRequest where request_id='${requestId}'`;
    let [[request]] = await con.query(sql);
    if (!request) return res.status(400).json({ message: '해당 포토카드 소유권 요청이 데이터에 없습니다.' });
    if (request.state !== 'waiting') return res.status(400).json({ message: '이미 발급 처리된 포토카드 소유권 요청입니다.' });

    // 포토카드 존재 여부 확인
    sql = `SELECT photocard_id from Photocard where photocard_id='${request.photocard_id}'`;
    let [[photocard]] = await con.query(sql);
    if (!photocard) return res.status(400).json({ message: '해당 포토카드는 데이터에 없습니다.' });

    // 해당 사용자의 임시 소유권 추가
    sql = `INSERT INTO Voucher (photocard_id, username, permanent) VALUES (?, ?, ?)`;
    let [result] = await con.execute(sql, [request.photocard_id, request.username, 0]);

    // 발급 내역 추가
    sql = `INSERT INTO VoucherProvision (voucher_id, provider, recipient, permanent) VALUES (?, ?, ?, ?)`;
    await con.execute(sql, [result.insertId, req.user.username, request.username, 0]);

    // 포토카드 요청의 처리 상태와 발급한 소유권 ID 업데이트
    sql = `UPDATE VoucherRequest SET state='temporary', voucher_id=${result.insertId} WHERE request_id=${requestId}`;
    await con.execute(sql);

    await con.commit(); // 수정된 DB 내용 반영
    return res.status(200).json({ message: '해당 사용자에게 포토카드 임시 소유권을 발급했습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    await con.rollback();
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 기존의 포토카드 소유권 요청 정보를 가지고 발급했던 임시 소유권을 영구 소유권으로 변경
router.put('/provision/request', verifyLogin, async (req, res) => {
  const { requestId } = req.body;
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  // 유효성 검사
  if (!requestId) return res.status(403).json({ message: '포토카드 소유권 요청글을 선택해주세요' });

  const con = await db.getConnection();
  try {
    await con.beginTransaction();

    // 포토카드 요청 존재 여부 확인
    sql = `SELECT username, photocard_id, state, voucher_id from VoucherRequest where request_id='${requestId}'`;
    let [[request]] = await con.query(sql);
    if (!request) return res.status(400).json({ message: '해당 포토카드 소유권 요청이 데이터에 없습니다.' });
    if (request.state !== 'temporary') return res.status(400).json({ message: '이미 발급 처리된 포토카드 소유권 요청입니다.' });
    if (!request.voucher_id) return res.status(400).json({ message: '아직 임시 소유권이 발급되지 않은 요청입니다.' });

    // 포토카드 존재 여부 확인
    sql = `SELECT photocard_id from Photocard where photocard_id='${request.photocard_id}'`;
    let [[photocard]] = await con.query(sql);
    if (!photocard) return res.status(400).json({ message: '해당 포토카드는 데이터에 없습니다.' });

    // 소유권 존재 여부 확인
    sql = `SELECT state, permanent from Voucher where voucher_id=${request.voucher_id}`;
    let [[voucher]] = await con.query(sql);
    if (!voucher) return res.status(400).json({ message: '해당 포토카드 소유권은 데이터에 없습니다.' });

    // 해당 사용자에게 발급했던 임시 소유권을 영구 소유권으로 전환
    sql = `UPDATE Voucher SET permanent=1 WHERE voucher_id=${request.voucher_id}`;
    await con.execute(sql, [request.photocard_id, request.username, 0]);

    // 포토카드 소유권 요청에도 영구로 수정
    sql = `UPDATE VoucherRequest SET state='finished' WHERE voucher_id=${request.voucher_id}`;
    await con.execute(sql, [request.photocard_id, request.username, 0]);

    // 발급 내역 추가
    sql = `INSERT INTO VoucherProvision (voucher_id, provider, recipient, permanent) VALUES (?, ?, ?, ?)`;
    await con.execute(sql, [request.voucher_id, req.user.username, request.username, 1]);

    await con.commit(); // 수정된 DB 내용 반영
    return res.status(200).json({ message: '해당 사용자에게 포토카드 소유권을 발급했습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    await con.rollback(); // 오류 발생하면 수행했던 DB 트랜잭션 롤백 (commit 한 이후에 rollback해도 수정된 내용 그대로 반영되어있는지 불확실함)
    con.release();
  }
  
  return res.status(501).json({ message: 'end of line' });
});

// 발급했던 임시 소유권을 발급 취소함.
router.post('/revert/:requestId', verifyLogin, async (req, res) => {
  const { requestId } = req.params;
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  // 유효성 검사
  if (!requestId) return res.status(400).json({ message: '포토카드 소유권 요청글을 선택해주세요.' });

  const con = await db.getConnection();
  try {
    await con.beginTransaction();

    // 소유권 정보 가져오기
    let sql = `
    SELECT V.voucher_id
    FROM VoucherRequest as REQ
    INNER JOIN Voucher as V ON V.voucher_id = REQ.voucher_id
    WHERE request_id=${requestId}`;
    let [[voucher]] = await con.query(sql);
    if (!voucher) return res.status(404).json({ message: '해당 소유권을 찾을 수 없습니다.' });

    // 해당 소유권으로 교환된 기록 조회
    sql = `
    SELECT B.provider, B.recipient, B.voucher_id
    FROM TradeHistory as A
    INNER JOIN TradeHistory as B ON B.trade_id=A.trade_id
    WHERE A.voucher_id=${voucher.voucher_id}`;
    let [histories] = await con.query(sql);

    // 교환 기록을 순회하면서 해당 소유권의 주인을 원래의 provider 것으로 변경.
    try {
      await Promise.all(histories.map(async (history) => {
        let sql = `
        UPDATE Voucher
        SET username='${history.provider}'
        WHERE voucher_id=${history.voucher_id}`
        await con.execute(sql);
      }));
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    // 발급했던 임시 소유권 삭제
    sql = `DELETE FROM Voucher WHERE voucher_id=${voucher.voucher_id}`;
    await con.execute(sql);

    // 해당 소유권 요청을 초기 상태로 수정
    sql = `UPDATE VoucherRequest SET voucher_id=NULL, state='waiting' WHERE request_id=${requestId}`;
    await con.execute(sql);

    await con.commit();
    return res.status(200).json({ message: '해당 임시 소유권을 발급 취소했습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    await con.rollback();
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;