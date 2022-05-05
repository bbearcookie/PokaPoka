const router = require('../config/express').router;
const { db } = require('../config/database');
const { isAdmin, verifyLogin } = require('../utils/jwt');
const { isNull } = require('../utils/common');

//문의사항 작성
//DB suggestion table
//suggestion(자동 생성), username, category, state, title, content, write_time, update_time

//작성 완료 버튼을 눌렀을 때 DB에 내용 저장
router.post('/new', verifyLogin, async (req, res) => {
    const { title, content, category } = req.body;
    const { accessToken } = req;
    let { user } = req;

    //로그인 상태 검사
    if (!user) return res.status(400).json({ message: '로그인 상태가 아닙니다.' });
    
    const con = await db.getConnection();
    try {
        //데이터 유효성 검사
        if (!title) {
            return res.status(400).json({ message: '제목을 입력해주세요.' });
        }
        if (!content) {
            return res.status(400).json({ message: '내용을 입력해주세요.' });
        }
        if (!category) {
          return res.status(400).json({ message: '카테고리를 선택해주세요.' });
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

//문의사항 목록 조회
router.get('/list', verifyLogin, async (req, res) => {
    const { accessToken } = req;
    let { user } = req;

    // 문의사항 목록 조회
    const con = await db.getConnection();
    try {
      if(isAdmin(accessToken)){ // 관리자 일 경우
        let sql = `SELECT suggestion_id, state, category, title, username, write_time FROM suggestion`;
        let [suggestion] = await con.query(sql);
        return res.status(200).json({ message: '문의사항 목록 조회에 성공했습니다.', suggestion });
      }
      else if(user){  // 일반 사용자일 경우
        let sql = `SELECT suggestion_id, state, category, title, username, write_time FROM suggestion WHERE username='${user.username}'`;
        let [suggestion] = await con.query(sql);
        return res.status(200).json({ message: '문의사항 목록 조회에 성공했습니다.', suggestion });
      }
      else{
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


//문의사항 상세 조회
//POST viewing/{suggestionId} => 각 문의 글의 id
router.get('/viewing/:suggestionId', verifyLogin, async (req, res) => {
    const { suggestionId } = req.params;
    const { accessToken } = req;

    // 유효성 검사
    if (isNull(suggestionId)) return res.status(400).json({ message: '문의사항 번호를 입력해주세요' });
  
    // 문의사항 상세 조회
    const con = await db.getConnection();
    try {
      // 문의사항 존재 유무 확인
      let sql = `SELECT suggestion_id from suggestion WHERE suggestion_id=${suggestionId}`;
      let [[isSuggestion]] = await con.query(sql);
      if (!isSuggestion) return res.status(404).json({ message: '조회하려는 문의사항이 DB에 없습니다.' });

      //문의 사항 상세
      sql = `SELECT username, category, state, title, content, write_time FROM suggestion WHERE suggestion_id=${suggestionId}`;
      let [[suggestion]] = await con.query(sql);

      //문의 사항 답변 내용
      sql = `SELECT content FROM reply WHERE suggestion_id=${suggestionId}`;
      let [[reply]] = await con.query(sql);

      if(!reply){ // 답변이 아직 등록되지 않은 경우 문의사항만 반환
        return res.status(200).json({ message: '문의사항 상세 조회에 성공했습니다.', suggestion });
      }
      else{ // 답변이 등록 된 경우 문의사항과 답변을 모두 반환
        return res.status(200).json({ message: '문의사항 상세 조회에 성공했습니다.', suggestion, reply });
      }
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
    const { suggestionId } = req.params;
    const { accessToken } = req;
  
    // 관리자 권한 확인
    if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });
  
    const con = await db.getConnection();
    try {
      // 문의사항 존재 유무 확인
      let sql = `SELECT suggestion_id from suggestion WHERE suggestion_id=${suggestionId}`;
      let [[suggestion]] = await con.query(sql);
      if (!suggestion) return res.status(404).json({ message: '삭제하려는 문의사항이 DB에 없습니다.' });

      // DB에서 그룹 삭제
      sql = `DELETE FROM suggestion WHERE suggestion_id=${suggestionId}`;
      await con.execute(sql);

      //답변이 있는지 확인해서 있으면 삭제
      sql = `SELECT suggestion_id from reply WHERE suggestion_id=${suggestionId}`;
      let [[reply]] = await con.query(sql);
      if (reply) {
        sql = `DELETE FROM reply WHERE suggestion_id=${suggestionId}`;
        await con.query(sql);
      }
  
      return res.status(200).json({ message: '문의사항을 삭제했습니다.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
      con.release();
    }
  });

//문의사항 답변(처리)
//DB reply
//reply_id, username, content, write_time, update_time
//POST /api/suggestion/confimation
router.post('/reply/:suggestionId', verifyLogin, async (req, res) => {
  const { suggestionId } = req.params;
  const { content } = req.body;
  const { accessToken } = req;
  let { user } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  const con = await db.getConnection();
  try {
      // 문의사항 존재 유무 확인
      let sql = `SELECT suggestion_id from suggestion WHERE suggestion_id=${suggestionId}`;
      let [[suggestion]] = await con.query(sql);
      if (!suggestion) return res.status(404).json({ message: '처리하려는 문의사항이 DB에 없습니다.' });

      //데이터 유효성 검사
      if (!content) return res.status(400).json({ message: '내용을 입력해주세요.' });
      
      //문의사항 답변 존재 여부
      sql = `SELECT suggestion_id from reply WHERE suggestion_id=${suggestionId}`;
      [[reply]] = await con.query(sql);

      if(!reply){
        //문의사항 답변 DB에 등록
        sql = `INSERT into reply(suggestion_id, username, content)
        values(?, ?, ?)`;
        await con.execute(sql, [suggestionId ,user.username, content]);
      }
      else{
        //문의사항 답변 이미 있는 경우 수정
        sql = `UPDATE reply SET content='${content}', update_time=NOW() WHERE suggestion_id=${suggestionId}`;
        await con.execute(sql);
      }
      // DB에서 처리 상태 UPDATE
      sql = `UPDATE suggestion SET state='commented', update_time=NOW() WHERE suggestion_id=${suggestionId}`;
      await con.execute(sql);

      return res.status(200).json({ message: '문의사항 답변이 등록되었습니다.'});
  } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
      con.release();
  }
});

module.exports = router;