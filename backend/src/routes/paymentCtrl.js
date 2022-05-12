const router = require('../config/express').router;
const { db } = require('../config/database');
const { verifyLogin, isAdmin } = require('../utils/jwt');
const crypto = require('crypto');
const axios = require('axios');

//결제 시도시 결제 내용 등록
router.post('/mypage/request', verifyLogin, async (req, res) => {
    const { payment } = req.body;
    payment.merchant_uid = `mid_${crypto.randomBytes(16).toString('hex')}`;
    let { user } = req;

    //if(!vouchers) return res.status(400).json({ message: '배송하실 소유권을 추가해주세요.' });
    //console.log("username: "+user.username+"\npayment_uid: "+payment.merchant_uid+"\npayment_price: "+payment.amount+"\nvoucher_id: "+useVouchers);
  
    const con = await db.getConnection();
    try {
      let sql = `INSERT INTO ShippingRequest (username, payment_uid, payment_price) VALUES (?, ?, ?)`;
      await con.execute(sql, [user.username, payment.merchant_uid, payment.amount]);
      
      return res.status(200).json({
        payment,
        impcode: process.env.IMPORT_IMPCODE
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({message: 'DB 문제 발생'});
    } finally {
      con.release();
    }
});
  
// 결제 성공시 위변조 검증 후 완료 처리
router.post('/mypage/complete', async (req, res) => {
    const { imp_uid, merchant_uid } = req.body;
  
    const con = await db.getConnection();
    try {
      // 액세스 토큰 발급 받기
      const getToken = await axios({
        url: 'https://api.iamport.kr/users/getToken',
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        data: {
          imp_key: process.env.IMPORT_IMPKEY,
          imp_secret: process.env.IMPORT_IMPSECRET
        }
      });
      const { access_token } = getToken.data.response;
  
      // imp_uid로 아임포트 서버에서 결제 정보 조회
      const getPaymentData = await axios({
        url: `https://api.iamport.kr/payments/${imp_uid}`,
        method: 'get',
        headers: { "Authorization": access_token }
      });
      const iamportPayment = getPaymentData.data.response;
  
      // DB에 저장된 결제 정보 조회
      let sql = `SELECT * FROM ShippingRequest WHERE payment_uid='${merchant_uid}'`;
      const [[dbPayment]] = await con.execute(sql);
  
      // 아임포트 서버에서 실제로 결제된 금액과 DB에 저장된 결제해야할 금액이 일치하는지 체크함.
      // 금액이 일치하면 DB에도 status 값을 결제가 완료되었음을 뜻하는 paid로 변경함.
      if (iamportPayment.payment_price === dbPayment.payment_price) {
        switch (iamportPayment.status) {
          case "paid":
            let sql = `UPDATE ShippingRequest SET payment_state='paid' WHERE payment_uid='${merchant_uid}'`;
            await con.execute(sql);
            return res.status(200).json({ message: '일반 결제 성공'});
        }
      } else {
        let sql = `UPDATE ShippingRequest SET payment_state='forgery' WHERE payment_uid='${merchant_uid}'`;
        await con.execute(sql);
        return res.status(200).json({ message: '위조된 결제 시도'});
      }
      console.log(iamportPayment);
      console.log(dbPayment);
  
      return res.status(200).json({ paymentData: iamportPayment });
    } catch (err) {
      console.error(err);
      return res.status(500).json({message: '서버 문제 발생'});
    } finally {
      con.release();
    }
});
  
// 사용자가 결제 시도를 해서 결제 정보를 DB에 저장을 해놓고 취소했을 때 그 결제 내용은 필요없으니 삭제함.
// 단, 해당 merchant_uid 결제의 주인만 이 API에 접근할 수 있게끔 해야한다. DB에 사용자 계정의 고유한 ID로 저장하고 그 값 비교하면 될듯.
router.delete('/mypage/:merchant_uid', async (req, res) => {
    const { merchant_uid } = req.params;
    console.log(merchant_uid);
  
    const con = await db.getConnection();
    try {
      let sql =
      `DELETE FROM ShippingRequest
      WHERE payment_uid='${merchant_uid}'`;
      await con.execute(sql);
      return res.status(200).json({message: '결제 요청 내역 삭제'});
    } catch (err) {
      console.error(err);
      return res.status(500).json({message: 'DB 문제 발생'});
    } finally {
      con.release();
    }
});

module.exports = router;