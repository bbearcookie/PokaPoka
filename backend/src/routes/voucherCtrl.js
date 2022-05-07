const router = require('../config/express').router;
const { db } = require('../config/database');
const { voucherImageUpload, VOUCHER_IMAGE_DIR } = require('../config/multer');
const { isAdmin, verifyLogin } = require('../utils/jwt');

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
  if (!delivery) return res.status(400).json({ message: '택배사를 입력해주세요.' });
  if (!trackingNumber) return res.status(400).json({ message: '운송장 번호를 입력해주세요.' });
  if (!photocardId) return res.status(400).json({ message: '발급 받고자 하는 포토카드를 선택해주세요.' });

  const con = await db.getConnection();
  try {
    // let sql = `INSERT INTO VoucherRequest (username, photocard_id, )`
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

//조회
//포토카드 발급 요청 조회
router.get('/voucher/request/list', verifyLogin, async (req, res) => {
  const { accessToken } = req;
  let { user } = req;

  const con = await db.getConnection();
  try {
    if(isAdmin(accessToken)){ // 관리자 일 경우
      let sql = `SELECT request_id, username, photocard_id, state, regist_time FROM VoucherRequest`;
      let [voucher] = await con.query(sql);
      return res.status(200).json({ message: '소유권 요청 목록 조회에 성공했습니다.', voucher });
    }
    else if(user){  // 일반 사용자일 경우
      let sql = `SELECT request_id, username, photocard_id, state, regist_time FROM VoucherRequest WHERE username='${user.username}'`;
      let [voucher] = await con.query(sql);
      return res.status(200).json({ message: '소유권 요청 목록 조회에 성공했습니다.', voucher });
    }
    else{ // 로그인 상태가 아닌 경우
      return res.status(403).json({ message: '로그인 상태가 아닙니다.' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

//포토카드 발급 기록 조회
router.get('/voucher/request/list', async (req, res) => {
  const con = await db.getConnection();
  try {
    let sql = `SELECT provision_id, provider, recipient, provide_time, photocard_id FROM VoucherProvision`;
    let [voucher] = await con.query(sql);
    return res.status(200).json({ message: '소유권 발급 기록 조회에 성공했습니다.', voucher });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

//포토카드 소유권 조회
router.get('/voucher/list', async (req, res) => {
  const con = await db.getConnection();
  try {
    let sql = `SELECT voucher_id, photocard_id, username, state, permanent, regist_time FROM voucher`;
    let [voucher] = await con.query(sql);
    return res.status(200).json({ message: '소유권 목록 조회에 성공했습니다.', voucher });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;