const router = require('../config/express').router;
const { db } = require('../config/database');
const { voucherImageUpload, VOUCHER_IMAGE_DIR } = require('../config/multer');
const { verifyLogin, isAdmin } = require('../utils/jwt');

// 사용자 본인의 소유권 발급 요청 조회
router.get('/request/list/mine', verifyLogin, async (req, res) => {
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(403).json({ message: '로그인 상태가 아닙니다.' });

  const con = await db.getConnection();
  try {
    let sql = `SELECT request_id, username, photocard_id, delivery, tracking_number, state, regist_time 
    FROM VoucherRequest 
    WHERE username='${user.username}'`;
    let [requests] = await con.query(sql);
    return res.status(200).json({ message: '포토카드 소유권 발급 요청 목록 조회에 성공했습니다.', requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 모든 포토카드 소유권 발급 요청 조회(관리자 전용)
router.get('/request/list/all', verifyLogin, async (req, res) => {
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  const con = await db.getConnection();
  try {
    let sql = `SELECT request_id, username, photocard_id, delivery, tracking_number, state, regist_time 
    FROM VoucherRequest`;
    let [requests] = await con.query(sql);
    return res.status(200).json({ message: '포토카드 소유권 발급 요청 목록 조회에 성공했습니다.', requests });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 포토카드 소유권 발급 요청 상세 조회
router.get('/request/detail/:requestId', async (req, res) => {
  const { requestId } = req.params;

  // 유효성 검사
  if (!requestId) return res.status(400).json({ message: '요청글 번호를 입력해주세요.' });

  const con = await db.getConnection();
  try {
    let sql = `SELECT request_id, username, photocard_id, delivery, tracking_number, state, regist_time 
    FROM VoucherRequest 
    WHERE request_id=${requestId}`;
    let [[request]] = await con.query(sql);
    return res.status(200).json({ message: '포토카드 소유권 발급 요청 상세 조회에 성공했습니다.', request });
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
    return res.status(400).json({ message: '로그인 상태가 아닙니다.' });
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
    let sql = `INSERT INTO VoucherRequest (username, photocard_id, delivery, tracking_number) VALUES (?, ?, ?, ?)`;
    await con.execute(sql, [user.username, photocardId, delivery, trackingNumber]);
    return res.status(200).json({ message: '관리자에게 포토카드 소유권 발급을 요청했습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 포토카드 소유권 발급
router.post('/provision', verifyLogin, async (req, res) => {
  // requestId는 발급 완료 처리할 소유권 요청의 id임
  const { recipient, permanent, photocardId, requestId } = req.body;
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

    // 특정 소유권 요청을 발급 완료 처리 해야 할 경우 처리
    if (requestId) {
      sql = `UPDATE VoucherRequest SET state='finished' WHERE request_id=${requestId}`;
      await con.execute(sql);
    }

    // 해당 사용자의 소유권 추가
    sql = `INSERT INTO Voucher (photocard_id, username, permanent) VALUES (?, ?, ?)`;
    let [result] = await con.execute(sql, [photocardId, recipient, permanent]);

    // 발급 내역 추가
    sql = `INSERT INTO VoucherProvision (voucher_id, provider, recipient) VALUES (?, ?, ?)`;
    await con.execute(sql, [result.insertId, req.user.username, recipient]);

    await con.commit(); // 수정된 DB 내용 반영
    return res.status(200).json({ message: '해당 사용자에게 포토카드 소유권을 발급했습니다.' });
  } catch (err) {
    console.error(err);
    con.rollback(); // 오류 발생하면 수행했던 DB 트랜잭션 롤백
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;