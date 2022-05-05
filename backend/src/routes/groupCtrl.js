const router = require('../config/express').router;
const path = require('path');
const fs = require('fs').promises;
const fsAsync = require('fs');
const { db } = require('../config/database');
const { getTimestampFilename, groupImageUpload, IDOL_GROUP_IMAGE_DIR } = require('../config/multer');
const { isAdmin, verifyLogin } = require('../utils/jwt');
const { isNull } = require('../utils/common');

// 아이돌 그룹 목록 조회 처리
router.get('/group/list', async (req, res) => {
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
router.get('/group/detail/:groupId', async (req, res) => {
  const { groupId } = req.params;

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

// 아이돌 그룹 등록 처리
router.post('/group', groupImageUpload.single('image'), verifyLogin, async (req, res) => {
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

    // DB에 저장
    sql = `INSERT INTO GroupData (name, description, gender) VALUES (?, ?, ?)`;
    let [result] = await con.execute(sql, [name, description, gender]);

    // 임시로 받은 이미지 파일의 이름을 실제로 저장할 이름으로 변경
    let filename = "";
    if (file) {
      filename = getTimestampFilename(result.insertId, file.mimetype);
      fsAsync.rename(file.path, path.join(file.destination, filename), (err) => {
        if (err) console.error(err);
      });
    }
    sql = `UPDATE GroupData SET image_name = '${filename}' WHERE group_id = ${result.insertId}`;
    await con.execute(sql);

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

// 아이돌 그룹 수정 처리
router.put('/group/:groupId', groupImageUpload.single('image'), verifyLogin, async (req, res) => {
  const { groupId } = req.params;
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
    // 수정하려는 그룹 존재 유무 확인
    let sql = `SELECT group_id, image_name FROM GroupData WHERE group_id=${groupId}`;
    let [[group]] = await con.query(sql);
    if (!group) {
      removeTempFile();
      return res.status(404).json({ message: '수정하려는 그룹이 DB에 없습니다.' });
    }

    // 임시로 받은 이미지 파일의 이름을 실제로 저장할 이름으로 변경하고 기존의 이미지 삭제
    let filename = "";
    if (file) {
      // 기존 이미지 삭제
      fsAsync.rm(path.join(file.destination, group.image_name), (err) => {
        if (err) console.error(err);
      });

      // 이미지 이름 변경
      filename = getTimestampFilename(groupId, file.mimetype);
      fsAsync.rename(file.path, path.join(file.destination, filename), (err) => {
        if (err) console.error(err);
      });

      // DB에 이미지 파일 이름 변경 내용 반영
      sql = `UPDATE GroupData SET image_name = '${filename}' WHERE group_id = ${groupId}`;
      await con.execute(sql);
    }

    // 수정된 내용 DB에 저장
    sql = `UPDATE GroupData 
    SET name = '${name}',
    description = '${description}',
    gender = '${gender}'
    WHERE group_id = ${groupId}`;
    await con.execute(sql);

    return res.status(200).json({ message: '아이돌 그룹 정보를 수정했습니다.' });
  } catch (err) {
    console.error(err);
    removeTempFile();
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 아이돌 그룹 삭제 처리
router.delete('/group/:groupId', verifyLogin, async (req, res) => {
  const { groupId } = req.params;
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  const con = await db.getConnection();
  try {
    // 그룹 존재 유무 확인
    let sql = `SELECT group_id, image_name from GroupData WHERE group_id=${groupId}`;
    let [[group]] = await con.query(sql);
    if (!group) return res.status(404).json({ message: '삭제하려는 그룹이 DB에 없습니다.' });

    // 제약조건 있는지 확인
    sql = `SELECT member_id from MemberData WHERE group_id=${groupId}`;
    [[member]] = await con.query(sql);
    if (member) return res.status(400).json({ message: '해당 그룹의 멤버 데이터가 남아있어서 삭제할 수 없습니다. 먼저 멤버를 정리해주세요.' });

    sql = `SELECT album_id from AlbumData WHERE group_id=${groupId}`;
    [[album]] = await con.query(sql);
    if (album) return res.status(400).json({ message: '해당 그룹의 앨범 데이터가 남아있어서 삭제할 수 없습니다. 먼저 앨범을 정리해주세요.' });

    // DB에서 그룹 삭제
    sql = `DELETE FROM GroupData WHERE group_id=${groupId}`;
    await con.execute(sql);

    // 이미지 파일 삭제
    fsAsync.rm(path.join(IDOL_GROUP_IMAGE_DIR, group.image_name), (err) => {
      if (err) console.error(err);
    });

    return res.status(200).json({ message: '아이돌 그룹 정보를 삭제했습니다.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }
});

module.exports = router;