const router = require('../config/express').router;
const { db } = require('../config/database');

//--------------------------------------------------------------------------------------------------
//문의사항 작성
//DB suggestion table
//suggestion(자동 생성), username, category, state, title, content, write_time, update_time

//작성 완료 버튼을 눌렀을 때 DB에 내용 저장
router.post('/new', async (req, res) => {
    const { category, title, content } = req.body;
    
    //username  가져오기 auth에서?
    //~~~

    //suggestion_id
    //INT, 1, 2, 3 ...

    let sql = `
    INSERT into suggestion(suggestion_id, username, category, title, content) 
    values(${suggestion_id}, ${username}, ${category}, ${title}, ${content})`;

    return res.status(200).json({ message: '문의사항이 등록되었습니다.' });
    //실패 return res.status(401).json({ message: '권한이 없습니다.' });
    //실패 return res.status(404).json({ message: '해당 문의사항을 찾을 수 없습니다.' });
  });

//--------------------------------------------------------------------------------------------------
//문의사항 목록 조회
//POST /list

//참고 코드 시작
router.get('/list', function(req, res, next) {  // list/1 이 아니라  /list 로만 라우팅됫을때 /list/1 로 보내준다
    res.redirect('/board/list/1');
});
router.get('/list/:page', function(req, res, next){ // board/list/page숫자 형식으로 받을거
    var page = req.params.page; // :page 로 맵핑할 req 값을 가져온다
    var sql = "SELECT idx, name, title, date_format(modidate, '%Y-%m-%d %H:%i:%s') modidate, " +   
        "date_format(regdate,'%Y-%m-%d %H:%i:%s') regdate from board";
        connection.query(sql, function(err, rows){  // select 쿼리문 날린 데이터를 rows 변수에 담는다 오류가 있으면 err
        if(err) console.error("err : " + err);
        res.render('list.ejs', {title : '게시판 리스트', rows:rows});
    });
});
//참고 코드 끝

router.get("/list", async (req, res, next) => {
    let sql = `
    SELECT username, category, title, write_time from suggestion`;
    let [list] = await con.execute(sql);

    return res.status(200).json(list);
    //실패 return res.status(401).json({ message: '권한이 없습니다.' });
  });

//--------------------------------------------------------------------------------------------------
//문의사항 상세 조회
//POST viewing/{suggestionId} => 각 문의 글의 id

//문의사항 삭제
//:suggestionId => 각 문의 글의 id
router.delete('/:suggestionId', async (req, res) => {
    const { suggestion_id } = req.body;

    let sql = `delete from suggestion where suggestion_id=${suggestion_id}`;

    return res.status(200).json({ message: '문의글이 삭제되었습니다.' });
    //실패 return res.status(401).json({ message: '권한이 없습니다.' });
    //실패 return res.status(404).json({ message: '해당 문의사항이 없습니다.' });
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