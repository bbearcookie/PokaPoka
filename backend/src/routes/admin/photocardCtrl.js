const router = require('../../config/express').router;
const path = require('path');
const fs = require('fs').promises;
const fsAsync = require('fs');
const { db } = require('../../config/database');
const { getTimestampFilename, photocardImageUpload, PHOTOCARD_IMAGE_DIR } = require('../../config/multer');
const { isAdmin, verifyLogin } = require('../../utils/jwt');
const { isNull } = require('../../utils/common');

// 포토카드 목록 반환
router.get('/photocard/list', verifyLogin, async (req, res) => {
  const { groupId, memberId } = req.query;
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  // 유효성 검사
  if (!groupId) return res.status(200).json({ message: '조회할 목록이 없습니다.', photocards: [] });
  if (!memberId) return res.status(200).json({ message: '조회할 목록이 없습니다.', photocards: [] });

  // 포토카드 목록 조회
  const con = await db.getConnection();
  try {
    // 해당 그룹 존재 유무 확인
    if (groupId !== 'all') {
      let sql = `SELECT name FROM GroupData WHERE group_id=${groupId}`;
      let [[group]] = await con.query(sql);
      if (!group) return res.status(404).json({ message: '해당 그룹을 DB에서 찾지 못했습니다.' });
    }

    // 해당 멤버 존재 유무 확인
    if (memberId !== 'all') {
      let sql = `SELECT name FROM MemberData WHERE member_id=${memberId}`;
      let [[member]] = await con.query(sql);
      if (!member) return res.status(404).json({ message: '해당 멤버를 DB에서 찾지 못했습니다.' });
    }

    // 모든 그룹의 모든 멤버의 포토카드 목록 조회
    let sql = "";
    if (groupId === 'all' && memberId === 'all') {
      sql = `SELECT photocard_id, group_id, member_id, album_id, name, image_name
      FROM Photocard`;
    // 특정 그룹의 모든 멤버의 포토카드 목록 조회
    } else if (memberId === 'all') {
      sql = `SELECT photocard_id, group_id, member_id, album_id, name, image_name
      FROM Photocard
      WHERE group_id=${groupId}`;
    // 모든 그룹의 특정 멤버의 포토카드 목록 조회
    } else if (groupId === 'all') {
      sql = `SELECT photocard_id, group_id, member_id, album_id, name, image_name
      FROM Photocard
      WHERE member_id=${memberId}`;
    // 특정 멤버의 포토카드 목록 조회
    } else {
      sql = `SELECT photocard_id, group_id, member_id, album_id, name, image_name
      FROM Photocard
      WHERE group_id=${groupId} AND member_id=${memberId}`;
    }
    let [photocards] = await con.query(sql);
    return res.status(200).json({ message: '포토카드 목록 조회에 성공했습니다.', photocards });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 포토카드 상세 조회 처리
router.get('/photocard/detail/:photocardId', verifyLogin, async (req, res) => {
  const { photocardId } = req.params;
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  // 유효성 검사
  if (isNull(photocardId)) return res.status(400).json({ message: '포토카드 번호를 입력해주세요' });

  // 포토카드 상세 조회
  const con = await db.getConnection();
  try {
    // 포토카드 내용 조회
    let sql = `SELECT name, image_name, group_id, member_id, album_id
    FROM Photocard WHERE photocard_id=${photocardId}`;
    let [[photocard]] = await con.query(sql);

    // 그룹 내용 조회
    sql = `SELECT name, description, gender, image_name FROM GroupData WHERE group_id=${photocard.group_id}`;
    let [[group]] = await con.query(sql);

    // 멤버 내용 조회
    sql = `SELECT name, description, image_name FROM MemberData WHERE member_id=${photocard.member_id}`;
    let [[member]] = await con.query(sql);

    // 앨범 내용 조회
    sql = `SELECT name, description, image_name FROM AlbumData WHERE album_id=${photocard.album_id}`;
    let [[album]] = await con.query(sql);

    return res.status(200).json({ message: '포토카드 상세 조회에 성공했습니다.', photocard, group, member, album });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

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
    return res.status(400).json({ message: '그룹을 선택해주세요.' });
  }
  if (!memberId) {
    removeTempFile();
    return res.status(400).json({ message: '멤버를 선택해주세요.' });
  }
  if (!albumId) {
    removeTempFile();
    return res.status(400).json({ message: '앨범을 선택해주세요.' });
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
      filename = getTimestampFilename(result.insertId, file.mimetype);
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

// 포토카드 수정 처리
router.put('/photocard/:photocardId', photocardImageUpload.single('image'), verifyLogin, async (req, res) => {
  const { photocardId } = req.params;
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
    return res.status(400).json({ message: '그룹을 선택해주세요.' });
  }
  if (!memberId) {
    removeTempFile();
    return res.status(400).json({ message: '멤버를 선택해주세요.' });
  }
  if (!albumId) {
    removeTempFile();
    return res.status(400).json({ message: '앨범을 선택해주세요.' });
  }

  const con = await db.getConnection();
  try {
    // 수정하려는 멤버 존재 유무 확인
    let sql = `SELECT photocard_id, image_name FROM Photocard WHERE photocard_id=${photocardId}`;
    let [[photocard]] = await con.query(sql);
    if (!photocard) {
      removeTempFile();
      return res.status(404).json({ message: '수정하려는 포토카드가 DB에 없습니다.' });
    }

    console.log(file);
    // 임시로 받은 이미지 파일의 이름을 실제로 저장할 이름으로 변경하고 기존의 이미지 삭제
    let filename = "";
    if (file) {

      // 기존 이미지 삭제
      fsAsync.rm(path.join(file.destination, photocard.image_name), (err) => {
        if (err) console.error(err);
      });

      // 이미지 이름 변경
      filename = getTimestampFilename(photocardId, file.mimetype);
      fsAsync.rename(file.path, path.join(file.destination, filename), (err) => {
        if (err) console.error(err);
      });

      // DB에 이미지 파일 이름 변경 내용 반영
      sql = `UPDATE Photocard SET image_name='${filename}' WHERE photocard_id=${photocardId}`;
      await con.execute(sql);
    }

    // 수정된 내용 DB에 저장
    sql = `UPDATE Photocard 
    SET name='${name}',
    group_id=${groupId},
    member_id=${memberId},
    album_id=${albumId}
    WHERE photocard_id=${photocardId}`;
    await con.execute(sql);

    return res.status(200).json({ message: '포토카드 정보를 수정했습니다.' });
  } catch (err) {
    console.error(err);
    removeTempFile();
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 포토카드 삭제 처리
router.delete('/photocard/:photocardId', verifyLogin, async (req, res) => {
  const { photocardId } = req.params;
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  const con = await db.getConnection();
  try {
    // 포토카드 존재 유무 확인
    let sql = `SELECT photocard_id, image_name from Photocard WHERE photocard_id=${photocardId}`;
    let [[photocard]] = await con.query(sql);
    if (!photocard) return res.status(404).json({ message: '삭제하려는 포토카드가 DB에 없습니다.' });

    // DB에서 멤버 삭제
    sql = `DELETE FROM Photocard WHERE photocard_id=${photocardId}`;
    await con.execute(sql);

    // 이미지 파일 삭제
    fsAsync.rm(path.join(PHOTOCARD_IMAGE_DIR, photocard.image_name), (err) => {
      if (err) console.error(err);
    });

    return res.status(200).json({ message: '포토카드 정보를 삭제했습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;