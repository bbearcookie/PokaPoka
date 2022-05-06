const router = require('../config/express').router;
const { db } = require('../config/database');
const { voucherImageUpload, VOUCHER_IMAGE_DIR } = require('../config/multer');
const { verifyLogin, isAdmin } = require('../utils/jwt');

// 사용자 본인의 소유권 발급 요청 조회
router.get('/voucher/list/mine', verifyLogin, async (req, res) => {
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
router.get('/voucher/list/all', verifyLogin, async (req, res) => {
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
router.get('/voucher/detail/:requestId', async (req, res) => {
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
router.post('/voucher/request', voucherImageUpload.single('image'), verifyLogin, async (req, res) => {
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

module.exports = router;