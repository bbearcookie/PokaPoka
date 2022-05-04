const router = require('../config/express').router;
const { db } = require('../config/database');
const { isAdmin, verifyLogin } = require('../utils/jwt');

//--------------------------------------------------------------------------------------------------
//문의사항 작성
//DB suggestion table
//suggestion(자동 생성), username, category, state, title, content, write_time, update_time

//작성 완료 버튼을 눌렀을 때 DB에 내용 저장
router.post('/new', verifyLogin, async (req, res) => {
    const { category, title, content } = req.body;
    const { accessToken } = req;

    //console.log(accessToken.payload.username);
    
    const con = await db.getConnection();
    try {
        //데이터 유효성 검사
        if (!category) {
            return res.status(400).json({ message: '카테고리를 선택해주세요.' });
        }
        if (!title) {
            return res.status(400).json({ message: '제목을 입력해주세요.' });
        }
        if (!content) {
            return res.status(400).json({ message: '내용을 입력해주세요.' });
        }
        //문의사항 DB에 등록
        let sql = `INSERT into suggestion(username, category, title, content) 
        values(?, ?, ?, ?)`;
        let [result] = await con.execute(sql, [accessToken.payload.username, category, title, content]);

        return res.status(200).json({ message: '문의사항이 등록되었습니다.'});
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
        con.release();
    }
  });

//--------------------------------------------------------------------------------------------------
//문의사항 목록 조회
router.get('/list', verifyLogin, async (req, res) => {
    const { accessToken } = req;
  
    // 관리자 권한 확인
    if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });
  
    // 문의사항 목록 조회
    const con = await db.getConnection();
    try {
      let sql = `SELECT suggestion_id, category, title, username, write_time FROM suggestion`;
      let [suggestion] = await con.query(sql);
      return res.status(200).json({ message: '문의사항 목록 조회에 성공했습니다.', suggestion });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
      con.release();
    }
  
    return res.status(501).json({ message: 'end of line' });
  });

//--------------------------------------------------------------------------------------------------
//문의사항 상세 조회
//POST viewing/{suggestionId} => 각 문의 글의 id
router.get('/viewing/:suggestion', verifyLogin, async (req, res) => {
    const { suggestion_id } = req.params;
    const { accessToken } = req;
  
    // 관리자 권한 확인
    if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });
  
    // 유효성 검사
    if (isNull(suggestion_id)) return res.status(400).json({ message: '문의사항 번호를 입력해주세요' });
  
    // 문의사항 상세 조회
    const con = await db.getConnection();
    try {
      let sql = `SELECT username, category, state, title, content, wrtie_time FROM suggestion WHERE suggestion_id=${suggestion_id}`;
      let [[suggestion]] = await con.query(sql);
      return res.status(200).json({ message: '문의사항 상세 조회에 성공했습니다.', suggestion });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
      con.release();
    }
  
    return res.status(501).json({ message: 'end of line' });
  });

// 문의사항 삭제 처리
router.delete('/:suggestionId', verifyLogin, async (req, res) => {
    const { suggestion_id } = req.params;
    const { accessToken } = req;

    console.log(suggestion_id);
  
    // 관리자 권한 확인
    if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });
  
    const con = await db.getConnection();
    try {
      // 문의사항 존재 유무 확인
      let sql = `SELECT suggestion_id from suggestion WHERE suggestion_id=${suggestion_id}`;
      let [[suggestion]] = await con.query(sql);
      if (!suggestion) return res.status(404).json({ message: '삭제하려는 문의사항이 DB에 없습니다.' });

      // DB에서 그룹 삭제
      sql = `DELETE FROM suggestion WHERE suggestion_id=${suggestion_id}`;
      await con.execute(sql);
  
      return res.status(200).json({ message: '문의사항을 삭제했습니다.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
      con.release();
    }
  });
//--------------------------------------------------------------------------------------------------
//문의사항 처리
//state 값 수정

//--------------------------------------------------------------------------------------------------
//문의사항 답변
//DB reply
//reply_id, username, content, write_time, update_time
//POST /api/suggestion/confimation




module.exports = router;