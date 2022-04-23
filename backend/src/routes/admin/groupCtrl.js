const router = require('../../config/express').router;
const path = require('path');
const fs = require('fs').promises;
const fsAsync = require('fs');
const { db } = require('../../config/database');
const { getExtension, groupImageUpload } = require('../../config/multer');
const { isAdmin, verifyLogin } = require('../../utils/jwt');
const { isNull } = require('../../utils/common');

// 아이돌 그룹 목록 조회 처리
router.get('/list', verifyLogin, async (req, res) => {
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  // 아이돌 그룹 목록 조회
  const con = await db.getConnection();
  try {
    let sql = `SELECT group_id, name, image_name FROM GroupData`;
    let [groups] = await con.query(sql);
    return res.status(200).json({ message: '아이돌 그룹 목록 조회에 성공했습니다.', groups });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 아이돌 그룹 상세 조회 처리
router.get('/detail/:groupId', verifyLogin, async (req, res) => {
  const { groupId } = req.params;
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  // 유효성 검사
  if (isNull(groupId)) return res.status(400).json({ message: '그룹 번호를 입력해주세요' });

  // 아이돌 그룹 상세 조회
  const con = await db.getConnection();
  try {
    let sql = `SELECT name, description, gender, image_name FROM GroupData WHERE group_id=${groupId}`;
    let [[group]] = await con.query(sql);
    return res.status(200).json({ message: '아이돌 그룹 정보 상세 조회에 성공했습니다.', group });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 아이돌 그룹 추가 처리
router.post('/', groupImageUpload.single('image'), verifyLogin, async (req, res) => {
  const { name, description, gender } = req.body;
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
  if (!description) {
    removeTempFile();
    return res.status(400).json({ message: '설명을 입력해주세요.' });
  }
  if (!gender) {
    removeTempFile();
    return res.status(400).json({ message: '성별을 체크해주세요.' });
  }

  const con = await db.getConnection();
  try {
    // 그룹 이름 중복 검사
    let sql = `SELECT name, image_name FROM GroupData WHERE name='${name}'`;
    let [[group]] = await con.query(sql);
    if (group) {
      removeTempFile();
      return res.status(400).json({ message: '이미 있는 그룹 이름입니다.' });
    }

    // 임시로 받은 이미지 파일의 이름을 실제로 저장할 이름으로 변경
    let filename = "";
    if (file) {
      filename = name + '.' + getExtension(file.mimetype);
      fsAsync.rename(file.path, path.join(file.destination, filename), (err) => {
        if (err) console.error(err);
      });
    }

    // DB에 저장
    sql = `INSERT INTO GroupData (name, description, gender, image_name) VALUES (?, ?, ?, ?)`;
    await con.execute(sql, [name, description, gender, filename]);

    return res.status(200).json({ message: '새로운 그룹을 추가했습니다.' });
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