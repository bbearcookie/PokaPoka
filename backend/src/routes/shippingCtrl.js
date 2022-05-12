const router = require('../config/express').router;
const { db } = require('../config/database');
const { verifyLogin, isAdmin } = require('../utils/jwt');

// 마이페이지 배송 정보 - 일반 사용자
router.get('/shipping/deliveryInfo', verifyLogin, async (req, res) => {
    let { user } = req;
  
    // 로그인 상태 확인
    if (!user) return res.status(403).json({ message: '로그인 상태가 아닙니다.' });
  
    const con = await db.getConnection();
    try {
      let sql = `SELECT name, phone, address
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

// 사용자 주소 데이터 업데이트 - 일반 사용자
router.put('/shipping/addressUpdate', verifyLogin, async (req, res) => {
    let { address, address_detail } = req.body;
    let { user } = req;

    if(address) address = address + ' ' + address_detail;
  
    // 로그인 상태 확인
    if (!user) return res.status(403).json({ message: '로그인 상태가 아닙니다.' });
  
    const con = await db.getConnection();
    try {
      // 수정하려는 회원 존재 유무 확인
      let sql = `SELECT username FROM User WHERE username='${user.username}'`;
      let [[userInfo]] = await con.query(sql);
      if (!userInfo) {
        return res.status(404).json({ message: '수정하려는 회원이 DB에 없습니다.' });
      }
  
      // 수정된 내용 DB에 저장
      sql = `UPDATE User 
      SET address = '${address}' 
      WHERE username = '${user.username}'`;
      await con.execute(sql);
  
      if(!address) return res.status(200).json({ message: '주소를 삭제했습니다.' });
      else return res.status(200).json({ message: '주소를 추가했습니다.' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
    } finally {
      con.release();
    }
  
    return res.status(501).json({ message: 'end of line' });
  });

//결제 성공시 배송할 소유권 데이터 등록
router.post('/shipping/mypage/voucher', verifyLogin, async (req, res) => {
  let { user } = req;
  const { useVouchers } = req.body;
  const { merchant_uid } = req.body;

  console.log("결제 아이디: "+merchant_uid);

  if(!useVouchers) return res.status(400).json({ message: '배송하실 소유권을 추가해주세요.' });

  const con = await db.getConnection();
  try {
      let sql =  `SELECT request_id FROM ShippingRequest WHERE payment_uid='${merchant_uid}'`
      let [[request]] = await con.execute(sql);

      console.log("request_id: "+request.request_id);

      //배송할 소유권 목록 ShippingWant 테이블에 등록
      useVouchers.forEach(async (element) => {
        console.log("element: "+element);
        sql = `INSERT INTO ShippingWant (request_id, voucher_id) VALUES (?, ?)`;
        await con.execute(sql, [request.request_id, element]);
      });
    return res.status(200).json({message:'배송할 소유권 등록 완료'});
  } catch (err) {
    console.error(err);
    return res.status(500).json({message: 'DB 문제 발생'});
  } finally {
    con.release();
  }
});

// 배송 요청 목록 조회
router.get('/shipping/list', verifyLogin, async (req, res) => {
  const { accessToken } = req;
  let { user } = req;

  const con = await db.getConnection();
  try {
    if(isAdmin(accessToken)){ // 관리자 일 경우
      let sql = `SELECT request_id, state, username, regist_time FROM ShippingRequest`;
      let [request] = await con.query(sql);
      return res.status(200).json({ message: '배송 요청 목록 조회에 성공했습니다.', request });
    }
    else if(user){  // 일반 사용자일 경우
      let sql = `SELECT request_id, state, username, regist_time FROM ShippingRequest WHERE username='${user.username}'`;
      let [request] = await con.query(sql);
      return res.status(200).json({ message: '배송 요청 목록 조회에 성공했습니다.', request });
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

// 배송 요청 상세 조회
router.get('/shipping/detail/:requestId', verifyLogin, async (req, res) => {
  const { requestId } = req.params;
  const { accessToken } = req;

  // 유효성 검사
  if (!requestId) return res.status(400).json({ message: '요청 번호를 입력해주세요' });

  // 배송 요청 상세 조회
  const con = await db.getConnection();
  try {
    // 배송 요청 존재 유무 확인
    let sql = `SELECT request_id from ShippingRequest WHERE request_id=${requestId}`;
    let [[request]] = await con.query(sql);
    if (!request) return res.status(404).json({ message: '조회하려는 배송 요청이 DB에 없습니다.' });

    //배송 요청 상세
    sql = `SELECT username, state, payment_price, payment_state, regist_time FROM ShippingRequest WHERE request_id=${requestId}`;
    let [[requests]] = await con.query(sql);

    //배송 요청 소유권 내용
    sql = `SELECT voucher_id FROM ShippingWant WHERE request_id=${requestId}`;
    let [vouchers] = await con.query(sql);

    return res.status(200).json({ message: '배송 요청 상세 조회에 성공했습니다.', requests, vouchers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 관리자 - 배송 요청 상세 조회
router.get('/admin/shipping/detail/:requestId', verifyLogin, async (req, res) => {
  const { requestId } = req.params;
  const { accessToken } = req;

   // 관리자 권한 확인
   if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  // 유효성 검사
  if (!requestId) return res.status(400).json({ message: '요청 번호를 입력해주세요' });

  // 배송 요청 상세 조회
  const con = await db.getConnection();
  try {
    // 배송 요청 존재 유무 확인
    let sql = `SELECT request_id from ShippingRequest WHERE request_id=${requestId}`;
    let [[request]] = await con.query(sql);
    if (!request) return res.status(404).json({ message: '조회하려는 배송 요청이 DB에 없습니다.' });

    //배송 요청 상세
    sql = `SELECT username, state, payment_price, payment_state, regist_time FROM ShippingRequest WHERE request_id=${requestId}`;
    let [[requests]] = await con.query(sql);

    //배송 요청 주소
    sql = `SELECT name, address, phone FROM User WHERE username='${requests.username}'`;
    let[[users]] = await con.query(sql);

    //배송 요청 소유권 내용
    sql = `SELECT voucher_id FROM ShippingWant WHERE request_id=${requestId}`;
    let [vouchers] = await con.query(sql);

    return res.status(200).json({ message: '배송 요청 상세 조회에 성공했습니다.', requests, users, vouchers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;