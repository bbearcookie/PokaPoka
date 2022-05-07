const router = require('../config/express').router;
const { db } = require('../config/database');
const { verifyLogin, isAdmin } = require('../utils/jwt');
const { isNull } = require('../utils/common');

//사용자 정보 - 일반 사용자: 아이디, 이름, 전화번호, 닉네임, 최애그룹
router.get('/user/mypage', verifyLogin, async (req, res) => {
    let { user } = req;
  
    // 로그인 상태 확인
    if (!user) return res.status(403).json({ message: '로그인 상태가 아닙니다.' });
  
    const con = await db.getConnection();
    try {
      let sql = `SELECT username, name, phone, nickname, favorite 
      FROM User 
      WHERE username='${user.username}'`;
      [[user]] = await con.query(sql);
      return res.status(200).json({ message: '사용자 정보 조회에 성공했습니다.', user });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
      con.release();
    }
  
    return res.status(501).json({ message: 'end of line' });
});

// 회원 정보 수정 처리 - 일반 사용자
router.put('/user/mypage/edit', verifyLogin, async (req, res) => {
  const { name, nickname, favorite } = req.body;
  let { phone } = req.body;
  let { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(403).json({ message: '로그인 상태가 아닙니다.' });

  // 데이터 유효성 검사
  if (!name) return res.status(400).json({ message: '이름을 입력해주세요.' });
  if (name.length > 10) return res.status(400).json({ message: '이름은 최대 10글자까지 입력할 수 있습니다.' });
  if (!nickname) return res.status(400).json({ message: '닉네임을 입력해주세요.' });
  if (nickname.length > 20) return res.status(400).json({ message: '닉네임은 최대 20글자까지 입력할 수 있습니다.' });

  // 전화번호 유효성 검사
  if (!phone) return res.status(400).json({ message: '전화번호를 입력해주세요.' });
  let regex = /[^0-9]/g;
  phone = phone.replace(regex, ""); // 전화번호에서 숫자만 추출함.
  if (phone.length !== 11) return res.status(400).json({ message: '휴대폰 번호가 올바른 자릿수가 아닙니다.' });
  if (phone.substring(0, 2) !== '01') return res.status(400).json({ message: '휴대폰 번호는 01로 시작해야 합니다.' });

  // 휴대폰 인증 검사 //테스트할 때 매번 인증하지 않도록 잠시 주석처리
  // if (!checkSMSVerification(req)) return res.status(400).json({ message: '휴대폰 인증을 먼저 해주세요.' });
  // if (phone !== smsVerification.phone) return res.status(400).json({ message: '입력한 휴대폰 번호와 인증된 휴대폰 번호가 다릅니다.' });

  const con = await db.getConnection();
  try {
    // 수정하려는 회원 존재 유무 확인
    let sql = `SELECT username FROM User WHERE username='${user.username}'`;
    let [[userInfo]] = await con.query(sql);
    if (!userInfo) {
      return res.status(404).json({ message: '수정하려는 회원이 DB에 없습니다.' });
    }

    console.log(user.username);

    // 수정된 내용 DB에 저장
    sql = `UPDATE User 
    SET name = '${name}',
    phone = '${phone}',
    nickname = '${nickname}', 
    favorite = '${favorite}' 
    WHERE username = '${user.username}'`;
    await con.execute(sql);

    return res.status(200).json({ message: '회원정보를 수정했습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

//회원 정보 목록 - 관리자: 아이디, 이름, 전화번호, 닉네임, 최애그룹
router.get('/admin/user/list', verifyLogin, async (req, res) => {
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  // 회원 정보 목록 조회
  const con = await db.getConnection();
  try {
    let sql = `SELECT username, name, phone, nickname, favorite, regist_time FROM User WHERE role='user'`;
    let [user] = await con.query(sql);

    return res.status(200).json({ message: '문의사항 목록 조회에 성공했습니다.', user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

//회원 정보 목록 - 관리자: 아이디, 이름, 전화번호, 닉네임, 최애그룹
router.get('/admin/user/selectList', verifyLogin, async (req, res) => {
  const { accessToken } = req;
  const { keword } = req.query;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  // 회원 정보 목록 조회
  const con = await db.getConnection();
  try {
    if(keword === 'withdrawal'){
      let sql = `SELECT username, name, phone, nickname, favorite, regist_time FROM User WHERE withdrawal = 1`;
      let [user] = await con.query(sql);
      return res.status(200).json({ message: '탈퇴요청 목록 조회에 성공했습니다.', user });
    }
    else if(keword === 'inactive'){
      let sql = `SELECT username, name, phone, nickname, favorite, regist_time FROM User WHERE inactive = 1`;
      let [user] = await con.query(sql);
      return res.status(200).json({ message: '비활성화 목록 조회에 성공했습니다.', user });
    }
    else{
      return res.status(400).json({ message: '선택해주세요.'});
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

//회원 정보 상세 조회 - 관리자
router.get('/admin/user/detail/:username', verifyLogin, async (req, res) => {
  const { accessToken } = req;
  const { username } = req.params;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });
  // 유효성 검사
  if (isNull(username)) return res.status(400).json({ message: '회원 번호를 입력해주세요' });

  // 회원 정보 상세 조회
  const con = await db.getConnection();
  try {
    // 회원 존재 유무 확인
    let sql = `SELECT username from User WHERE username='${username}'`;
    let [[isUser]] = await con.query(sql);
    if (!isUser) return res.status(404).json({ message: '조회하려는 회원이 DB에 없습니다.' });

    //회원 정보 상세
    sql = `SELECT username, name, nickname, phone, address, favorite, withdrawal, inactive, regist_time 
    FROM User 
    WHERE username='${username}'`;
    let [[user]] = await con.query(sql);

    return res.status(200).json({ message: '문의사항 상세 조회에 성공했습니다.', user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;