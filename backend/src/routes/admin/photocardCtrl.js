const router = require('../../config/express').router;
const path = require('path');
const fs = require('fs').promises;
const fsAsync = require('fs');
const { db } = require('../../config/database');
const { getExtension, photocardImageUpload, PHOTOCARD_IMAGE_DIR } = require('../../config/multer');
const { isAdmin, verifyLogin } = require('../../utils/jwt');
const { isNull } = require('../../utils/common');

// 포토카드 등록 처리
router.post('/photocard', photocardImageUpload.single('image'), verifyLogin, async (req, res) => {
  const { groupId, memberId, albumId, name } = req.body;
  const { accessToken, file } = req;

  // 유효성 검사 실패시 다운 받은 임시 이미지 파일을 삭제하는 함수
  function removeTempFile() {
    if (file) {
      try { fs.rm(file.path); }
      catch (err) { console.error(err); }
    }
  }

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) {
    removeTempFile();
    return res.status(403).json({ message: '권한이 없습니다.' });
  }

  // 데이터 유효성 검사
  if (!name) {
    removeTempFile();
    return res.status(400).json({ message: '이름을 입력해주세요.' });
  }
  if (!groupId) {
    removeTempFile();
    return res.status(400).json({ message: '그룹 번호를 입력해주세요.' });
  }
  if (!memberId) {
    removeTempFile();
    return res.status(400).json({ message: '멤버 번호를 입력해주세요.' });
  }
  
  const con = await db.getConnection();
  try {
    // 해당 그룹 존재 여부 확인
    let sql = `SELECT name FROM GroupData WHERE group_id='${groupId}'`;
    let [[group]] = await con.query(sql);
    if (!group) {
      removeTempFile();
      return res.status(404).json({ message: '해당 그룹이 DB에 없습니다.' });
    }

    // 해당 멤버 존재 여부 확인
    sql = `SELECT name FROM MemberData WHERE member_id='${memberId}'`;
    let [[member]] = await con.query(sql);
    if (!member) {
      removeTempFile();
      return res.status(404).json({ message: '해당 멤버가 DB에 없습니다.' });
    }

    // 해당 앨범 존재 여부 확인
    sql = `SELECT name FROM AlbumData WHERE album_id='${albumId}'`;
    let [[album]] = await con.query(sql);
    if (!album) {
      removeTempFile();
      return res.status(404).json({ message: '해당 앨범이 DB에 없습니다.' });
    }

    // DB에 저장
    sql = `INSERT INTO Photocard (name, group_id, member_id, album_id) VALUES (?, ?, ?, ?)`;
    let [result] = await con.execute(sql, [name, groupId, memberId, albumId]);

    // 임시로 받은 이미지 파일의 이름을 실제로 저장할 이름으로 변경
    let filename = "";
    if (file) {
      filename = result.insertId + '.' + getExtension(file.mimetype);
      fsAsync.rename(file.path, path.join(file.destination, filename), (err) => {
        if (err) console.error(err);
      });
    }
    sql = `UPDATE Photocard SET image_name = '${filename}' WHERE photocard_id = ${result.insertId}`;
    await con.execute(sql);

    return res.status(200).json({ message: '새로운 포토카드를 등록했습니다.' });
  } catch (err) {
    console.error(err);
    removeTempFile();
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }
  
  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;