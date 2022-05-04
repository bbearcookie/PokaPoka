const router = require('../../config/express').router;
const path = require('path');
const fs = require('fs').promises;
const fsAsync = require('fs');
const { db } = require('../../config/database');
const { getTimestampFilename, albumImageUpload, ALBUM_IMAGE_DIR } = require('../../config/multer');
const { isAdmin, verifyLogin } = require('../../utils/jwt');
const { isNull } = require('../../utils/common');

// 특정 그룹의 앨범 목록 조회 처리
router.get('/album/list/:groupId', verifyLogin, async (req, res) => {
  const { groupId } = req.params;
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });
  
  // 유효성 검사
  if (!groupId) return res.status(400).json({ message: '그룹 번호를 입력해주세요.' });

  // 앨범 목록 조회
  const con = await db.getConnection();
  try {
    // 해당 그룹 존재 유무 확인
    let sql = `SELECT name FROM GroupData WHERE group_id=${groupId}`;
    let [[group]] = await con.query(sql);
    if (!group) return res.status(404).json({ message: '조회하려는 멤버의 그룹을 DB에서 찾지 못했습니다.' });

    // 해당 그룹의 모든 앨범 목록 반환
    sql = `SELECT album_id, group_id, name, image_name FROM AlbumData WHERE group_id=${groupId}`;
    let [albums] = await con.query(sql);
    return res.status(200).json({ message: '앨범 목록 조회에 성공했습니다.', albums });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }
  
  return res.status(501).json({ message: 'end of line' });
});

// 앨범 상세 조회 처리
router.get('/album/detail/:albumId', verifyLogin, async (req, res) => {
  const { albumId } = req.params;
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  // 유효성 검사
  if (isNull(albumId)) return res.status(400).json({ message: '멤버 번호를 입력해주세요' });

  // 앨범 상세 조회
  const con = await db.getConnection();
  try {
    let sql = `SELECT name, image_name FROM AlbumData WHERE album_id=${albumId}`;
    let [[album]] = await con.query(sql);
    return res.status(200).json({ message: '앨범 정보 상세 조회에 성공했습니다.', album });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 앨범 등록 처리
router.post('/album', albumImageUpload.single('image'), verifyLogin, async (req, res) => {
  const { groupId, name } = req.body;
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

  const con = await db.getConnection();
  try {
    // 해당 그룹 존재 여부 확인
    let sql = `SELECT name FROM GroupData WHERE group_id='${groupId}'`;
    let [[group]] = await con.query(sql);
    if (!group) {
      removeTempFile();
      return res.status(404).json({ message: '멤버를 추가하려는 대상 그룹이 DB에 없습니다.' });
    }

    // 멤버 이름 중복 검사
    sql = `SELECT name, image_name FROM AlbumData WHERE name='${name}'`;
    let [[album]] = await con.query(sql);
    if (album) {
      removeTempFile();
      return res.status(400).json({ message: '이미 있는 앨범 이름입니다.' });
    }

    // DB에 저장
    sql = `INSERT INTO AlbumData (name, group_id) VALUES (?, ?)`;
    let [result] = await con.execute(sql, [name, groupId]);

    // 임시로 받은 이미지 파일의 이름을 실제로 저장할 이름으로 변경
    let filename = "";
    if (file) {
      filename = getTimestampFilename(result.insertId, file.mimetype);
      fsAsync.rename(file.path, path.join(file.destination, filename), (err) => {
        if (err) console.error(err);
      });
    }
    sql = `UPDATE AlbumData SET image_name = '${filename}' WHERE album_id = ${result.insertId}`;
    await con.execute(sql);

    return res.status(200).json({ message: '새로운 앨범을 등록했습니다.' });
  } catch (err) {
    console.error(err);
    removeTempFile();
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 앨범 수정 처리
router.put('/album/:albumId', albumImageUpload.single('image'), verifyLogin, async (req, res) => {
  const { albumId } = req.params;
  const { name } = req.body;
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
  if (!albumId) {
    removeTempFile();
    return res.status(400).json({ message: '앨범 번호를 입력해주세요.' });
  }

  const con = await db.getConnection();
  try {
    // 수정하려는 앨범 존재 유무 확인
    let sql = `SELECT album_id, image_name FROM AlbumData WHERE album_id=${albumId}`;
    let [[album]] = await con.query(sql);
    if (!album) {
      removeTempFile();
      return res.status(404).json({ message: '수정하려는 앨범이 DB에 없습니다.' });
    }

    // 임시로 받은 이미지 파일의 이름을 실제로 저장할 이름으로 변경하고 기존의 이미지 삭제
    let filename = "";
    if (file) {
      // 기존 이미지 삭제
      fsAsync.rm(path.join(file.destination, album.image_name), (err) => {
        if (err) console.error(err);
      });

      // 이미지 이름 변경
      filename = getTimestampFilename(albumId, file.mimetype);
      fsAsync.rename(file.path, path.join(file.destination, filename), (err) => {
        if (err) console.error(err);
      });

      // DB에 이미지 파일 이름 변경 내용 반영
      sql = `UPDATE AlbumData SET image_name='${filename}' WHERE album_id=${albumId}`;
      await con.execute(sql);
    }

    // 수정된 내용 DB에 저장
    sql = `UPDATE AlbumData 
    SET name = '${name}'
    WHERE album_id = ${albumId}`;
    await con.execute(sql);

    return res.status(200).json({ message: '앨범 정보를 수정했습니다.' });
  } catch (err) {
    console.error(err);
    removeTempFile();
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }
  
  return res.status(501).json({ message: 'end of line' });
});

// 앨범 삭제 처리
router.delete('/album/:albumId', verifyLogin, async (req, res) => {
  const { albumId } = req.params;
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  const con = await db.getConnection();
  try {
    // 앨범 존재 유무 확인
    let sql = `SELECT album_id, image_name from AlbumData WHERE album_id=${albumId}`;
    let [[album]] = await con.query(sql);
    if (!album) return res.status(404).json({ message: '삭제하려는 앨범이 DB에 없습니다.' });

    // DB에서 멤버 삭제
    sql = `DELETE FROM AlbumData WHERE album_id=${albumId}`;
    await con.execute(sql);

    // 이미지 파일 삭제
    fsAsync.rm(path.join(ALBUM_IMAGE_DIR, album.image_name), (err) => {
      if (err) console.error(err);
    });

    return res.status(200).json({ message: '앨범 정보를 삭제했습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }
});

module.exports = router;