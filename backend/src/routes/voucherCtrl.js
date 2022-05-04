const router = require('../config/express').router;
const { db } = require('../config/database');
const { voucherImageUpload, VOUCHER_IMAGE_DIR } = require('../config/multer');
const { verifyLogin } = require('../utils/jwt');

// 포토카드 소유권 발급 요청
router.post('/voucher/request', voucherImageUpload.single('image'), verifyLogin, async (req, res) => {
  const { delivery, trackingNumber } = req.body;
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

module.exports = router;