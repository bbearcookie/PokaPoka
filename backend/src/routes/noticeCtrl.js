const router = require('../config/express').router;
const { db } = require('../config/database');
const { isAdmin, verifyLogin } = require('../utils/jwt');
const { isNull } = require('../utils/common');

// 공지사항 작성
router.post('/admin/new', verifyLogin, async (req, res) => {
    const { title, content } = req.body;
    const { accessToken } = req;

    // 관리자 권한 확인
    if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });
    
    const con = await db.getConnection();
    try {
        // 데이터 유효성 검사
        if (!title) {
            return res.status(400).json({ message: '제목을 입력해주세요.' });
        }
        if (!content) {
            return res.status(400).json({ message: '내용을 입력해주세요.' });
        }
        // 문의사항 DB에 등록
        let sql = `INSERT into notice(username, title, content) 
        values(?, ?, ?)`;
        let [result] = await con.execute(sql, [accessToken.payload.username, title, content]);

        return res.status(200).json({ message: '공지사항이 등록되었습니다.'});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
        con.release();
    }
});

// 공지사항 수정
router.put('/admin/:noticeId', verifyLogin, async (req, res) => {
    const { noticeId } = req.params;
    const { title, content } = req.body;
    const { accessToken } = req;
  
    // 관리자 권한 확인
    if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });
  
    // 데이터 유효성 검사
    if (!title) {
      return res.status(400).json({ message: '제목을 입력해주세요.' });
    }
    if (!content) {
      return res.status(400).json({ message: '내용을 입력해주세요.' });
    }
  
    const con = await db.getConnection();
    try {
      // 수정하려는 공지사항 존재 유무 확인
      let sql = `SELECT notice_id FROM notice WHERE notice_id=${noticeId}`;
      let [[notice]] = await con.query(sql);
      if (!notice) {
        removeTempFile();
        return res.status(404).json({ message: '수정하려는 공지사항이 DB에 없습니다.' });
      }
  
      // 수정된 내용 DB에 저장
      sql = `UPDATE notice 
      SET title = '${title}',
      content = '${content}', 
      update_time = NOW()  
      WHERE notice_id = ${noticeId}`;
      await con.execute(sql);
  
      return res.status(200).json({ message: '공지사항을 수정했습니다.' });
    } catch (err) {
      console.error(err);
      removeTempFile();
      return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
      con.release();
    }
  
    return res.status(501).json({ message: 'end of line' });
});

// 공지사항 삭제
router.delete('/admin/:noticeId', verifyLogin, async (req, res) => {
    const { noticeId } = req.params;
    const { accessToken } = req;
  
    // 관리자 권한 확인
    if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });
  
    const con = await db.getConnection();
    try {
      // 공지사항 존재 유무 확인
      let sql = `SELECT notice_id from notice WHERE notice_id=${noticeId}`;
      let [[notice]] = await con.query(sql);
      if (!notice) return res.status(404).json({ message: '삭제하려는 공지사항이 DB에 없습니다.' });

      // DB에서 공지사항 삭제
      sql = `DELETE FROM notice WHERE notice_id=${noticeId}`;
      await con.execute(sql);
  
      return res.status(200).json({ message: '공지사항을 삭제했습니다.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
      con.release();
    }
});

// 공지사항 목록 조회
router.get('/noticeList', async (req, res) => {
    const con = await db.getConnection();
    try {
      let sql = `SELECT notice_id, username, title, DATE_FORMAT(write_time, '%Y년 %m월 %d일') write_time FROM notice`;
      let [notice] = await con.query(sql);
      return res.status(200).json({ message: '공지사항 목록 조회에 성공했습니다.', notice });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
      con.release();
    }
  
    return res.status(501).json({ message: 'end of line' });
  });

// 공지사항 상세 조회
router.get('/detail/:noticeId', verifyLogin, async (req, res) => {
    const { noticeId } = req.params;
    const { accessToken } = req;
  
    // 유효성 검사
    if (isNull(noticeId)) return res.status(400).json({ message: '공지사항 번호를 입력해주세요' });
  
    // 공지사항 상세 조회
    const con = await db.getConnection();
    try {
      //공지사항 존재 유무 확인
      let sql = `SELECT notice_id from notice WHERE notice_id=${noticeId}`;
      let [[notice]] = await con.query(sql);
      if (!notice) return res.status(404).json({ message: '조회하려는 공지사항이 DB에 없습니다.' });

      sql = `SELECT username, title, content, DATE_FORMAT(write_time, '%Y년 %m월 %d일') write_time FROM notice WHERE notice_id=${noticeId}`;
      [[notice]] = await con.query(sql);
      return res.status(200).json({ message: '공지사항 상세 조회에 성공했습니다.', notice });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
      con.release();
    }
  
    return res.status(501).json({ message: 'end of line' });
  });

module.exports = router;