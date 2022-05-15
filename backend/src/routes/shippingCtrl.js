const router = require('../config/express').router;
const { db } = require('../config/database');
const { verifyLogin, isAdmin } = require('../utils/jwt');
const { isNull, getWhereClause } = require('../utils/common');

// 일반 사용자 - 마이페이지 배송 정보
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

// 일반 사용자 - 사용자 주소 데이터 업데이트
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

// 일반 사용자 - 사용자 본인이 소유한 포토카드 소유권 목록 조회
router.get('/shipping/request/voucher/mine', verifyLogin, async (req, res) => {
  const { permanent, state, groupId, memberId } = req.query; // WHERE 필터링 조건으로 사용될 값들
  const { user } = req;

  // 로그인 상태 확인
  if (!user) return res.status(400).json({ message: '로그인 상태가 아닙니다.' });

  const con = await db.getConnection();
  try {
    let whereSqls = []; // WHERE 절에 들어갈 조건문 배열. 조건 작성후 getWhereClause 호출하면 WHERE절에 알맞는 문자열로 반환됨
    whereSqls.push(`username='${user.username}'`);

    // 소유권 조회 조건에 permanent 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(permanent)) whereSqls.push(`permanent='${permanent}'`);

    // 소유권 조회 조건에 state 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(state)) whereSqls.push(`state='${state}'`);

    // 소유권 조회 조건에 특정 그룹과 멤버에 대한 필터링 조건이 있을 경우 WHERE 조건에 추가
    if (!isNull(groupId) && !isNull(memberId)) {
      // 모든 그룹의 모든 멤버에 대한 소유권 목록 조회
      if (groupId === 'all' && memberId === 'all') {
        // 특별한 WHERE 조건이 필요하지 않음.
      // 특정 그룹의 모든 멤버에 대한 소유권 목록 조회
      } else if (memberId === 'all') {
        whereSqls.push(`P.group_id=${groupId}`);
      // 그 외에 특정 멤버에 대한 소유권 목록 조회
      } else {
        whereSqls.push(`P.member_id=${memberId}`);
      }
    }

    whereSqls.push(`V.shipping=0`);

    // 목록 조회
    let sql = `
    SELECT voucher_id, state, permanent, P.photocard_id, P.group_id, P.member_id, P.album_id, P.image_name, P.name, A.name AS album_name
    FROM Voucher as V
    INNER JOIN Photocard as P ON V.photocard_id = P.photocard_id
    INNER JOIN AlbumData as A ON P.album_id = A.album_id
    ${getWhereClause(whereSqls)}
    ORDER BY P.group_id, voucher_id`;
    let [vouchers] = await con.query(sql);

    return res.status(200).json({ message: '포토카드 소유권 목록 조회에 성공했습니다.', vouchers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 일반 사용자 - 결제 성공시 배송할 소유권 데이터 등록
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

        //배송 요청한 소유권은 shipping 필드를 1로 변경: 배송 요청한 소유권은 다시 배송 요청이나 교환 불가 해야함
        sql = `UPDATE Voucher SET shipping='1' WHERE voucher_id=${element}`;
        await con.execute(sql);
      });
    return res.status(200).json({message:'배송할 소유권 등록 완료'});
  } catch (err) {
    console.error(err);
    return res.status(500).json({message: 'DB 문제 발생'});
  } finally {
    con.release();
  }
});

// 일반 사용자 & 관리자 - 배송 요청 목록 조회
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

// 일반 사용자 - 배송 요청 상세 조회
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

// 관리자 - 배송 요청 상세 페이지 : 요청자가 소유한 포토카드 소유권 목록
router.get('/shipping/voucher/mine', verifyLogin, async (req, res) => {
  const { permanent, state, memberId, groupId, username } = req.query; // WHERE 필터링 조건으로 사용될 값들
  const { accessToken } = req;

   // 관리자 권한 확인
   if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  const con = await db.getConnection();
  try {
    let whereSqls = []; // WHERE 절에 들어갈 조건문 배열. 조건 작성후 getWhereClause 호출하면 WHERE절에 알맞는 문자열로 반환됨
    whereSqls.push(`username='${username}'`);

    // 소유권 조회 조건에 permanent 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(permanent)) whereSqls.push(`permanent='${permanent}'`);

    // 소유권 조회 조건에 state 필드에 대한 조건이 있으면 WHERE 조건에 추가
    if (!isNull(state)) whereSqls.push(`state='${state}'`);

    // 소유권 조회 조건에 특정 그룹과 멤버에 대한 필터링 조건이 있을 경우 WHERE 조건에 추가
    if (!isNull(groupId) && !isNull(memberId)) {
      // 모든 그룹의 모든 멤버에 대한 소유권 목록 조회
      if (groupId === 'all' && memberId === 'all') {
        // 특별한 WHERE 조건이 필요하지 않음.
      // 특정 그룹의 모든 멤버에 대한 소유권 목록 조회
      } else if (memberId === 'all') {
        whereSqls.push(`P.group_id=${groupId}`);
      // 그 외에 특정 멤버에 대한 소유권 목록 조회
      } else {
        whereSqls.push(`P.member_id=${memberId}`);
      }
    }

    // 목록 조회
    let sql = `
    SELECT voucher_id, state, permanent, P.photocard_id, P.group_id, P.member_id, P.album_id, P.image_name, P.name, A.name AS album_name
    FROM Voucher as V
    INNER JOIN Photocard as P ON V.photocard_id = P.photocard_id
    INNER JOIN AlbumData as A ON P.album_id = A.album_id
    ${getWhereClause(whereSqls)}
    ORDER BY P.group_id, voucher_id`;
    let [vouchers] = await con.query(sql);

    return res.status(200).json({ message: '포토카드 소유권 목록 조회에 성공했습니다.', vouchers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 관리자 - 베송 요청 처리
router.post('/shipping/state/:requestId', verifyLogin, async (req, res) => {
  const { requestId } = req.params; // WHERE 필터링 조건으로 사용될 값들
  const { accessToken } = req;
  let { user } = req; // 관리자 정보

   // 관리자 권한 확인
   if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  const con = await db.getConnection();
  try {
    // 배송 요청 처리
    //처리 상태와 요청자 아이디 검색
    let sql = `SELECT state, username FROM ShippingRequest WHERE request_id=${requestId} `;
    let [[state]] = await con.query(sql);

    //처리 상태 업데이트
    if(state.state === 'waiting'){
      //배송 요청 처리 완료
      sql = `UPDATE ShippingRequest SET state='finished' WHERE request_id=${requestId} `;
      await con.execute(sql);

      //발급 내역 테이블에 데이터 등록
      sql = `INSERT INTO
      ShippingProvision (provider, recipient, request_id)
      VALUES (?, ?, ?)`;
      await con.execute(sql, [user.username, state.username, requestId]);

      return res.status(200).json({ message: '배송 요청 처리에 성공했습니다.' });
    }
    else{
      //배송 요청 처리 취소
      sql = `UPDATE ShippingRequest SET state='waiting' WHERE request_id=${requestId} `;
      await con.execute(sql);

      //발급 내역 테이블에 데이터 삭제
      sql = `DELETE FROM ShippingProvision WHERE request_id=${requestId}`;
      await con.execute(sql);

      return res.status(200).json({ message: '배송 요청 처리 취소에 성공했습니다.' });
    }
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }

  return res.status(501).json({ message: 'end of line' });
});

// 관리자 - 포토카드 배송 내역 조회
router.get('/shipping/provision', verifyLogin, async (req, res) => {
  const { accessToken } = req;

  // 관리자 권한 확인
  if (!isAdmin(accessToken)) return res.status(403).json({ message: '권한이 없습니다.' });

  const con = await db.getConnection();
  try {
    let sql = `
    SELECT provision_id, request_id, provider, recipient, provide_time
    FROM ShippingProvision
    ORDER BY provide_time DESC`;
    let [provisions] = await con.query(sql);

    return res.status(200).json({ message: '포토카드 배송 내역을 조회했습니다.', provisions });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'DB 오류가 발생했습니다.' });
  } finally {
    con.release();
  }


  return res.status(501).json({ message: 'end of line' });
});

module.exports = router;