const router = require('../config/express').router;
const { db } = require('../config/database');
const { makeSignature } = require('../utils/sns');
const { getRandomInt } = require('../utils/math');
const axios = require('axios');

// 인증번호 발송
router.post('/sending', async (req, res) => {
  let { phone } = req.body;

  // 데이터 유효성 검사
  if (!phone) return res.status(400).json({ message: '휴대폰 번호를 입력해주세요.' });
  let regex = /[^0-9]/g;
  phone = phone.replace(regex, ""); // 숫자만 추출함.
  if (phone.length !== 11) return res.status(400).json({ message: '휴대폰 번호가 올바른 자릿수가 아닙니다.' });
  if (phone.substring(0, 2) !== '01') return res.status(400).json({ message: '휴대폰 번호는 01로 시작해야 합니다.' });

  // 인증번호 생성해서 세션에 저장
  smsVerification = {
    phone, // 휴대폰 번호
    answer: getRandomInt(100000, 999999).toString(), // 생성한 인증번호
    expireAt: Date.now() + 180000, // 인증 제한 시간. 180초.
    verified: false // 인증 성공 여부
  };
  req.session.smsVerification = smsVerification;

  // 문자로 발송할 데이터
  const smsData = {
    type: 'SMS',
    contentType: 'COMM',
    countryCode: '82',
    from: process.env.NAVER_CALLER_PHONE,
    content: '[현장실습연계프로젝트]',
    messages: [
      {
        to: phone,
        content: `[현장실습연계프로젝트]\n인증번호는 ${smsVerification.answer} 입니다.`
      }
    ]
  };

  // 네이버 SMS API 호출을 위해 필요한 서명 생성
  const suburl = `/sms/v2/services/${process.env.NAVER_SERVICE_ID}/messages`;
  const method = 'POST';
  const timestamp = Date.now().toString();
  const signature = makeSignature(timestamp, suburl, method);

  // 네이버 SMS API 호출
  try {
    const data = await axios({
      url: 'https://sens.apigw.ntruss.com' + suburl,
      method,
      headers: {
        'Content-Type': "application/json; charset=utf-8",
        'x-ncp-apigw-timestamp': timestamp,
        'x-ncp-iam-access-key': process.env.NAVER_ACCESS_KEY,
        'x-ncp-apigw-signature-v2': signature
      },
      data: smsData
    });
    console.log(data.data);
    return res.status(200).json({ message: '인증번호가 발송되었습니다.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 문제로 인증번호를 발송하지 못했습니다.' });
  }

  return res.status(200).json({ message: 'end of line' });
});

// 인증번호 검증
router.post('/confirmation', async (req, res) => {
  let { smsVerification } = req.session;
  let { cert_num } = req.body;

  // 이미 인증이 되어있는 상태면 특별한 처리를 하지 않음.
  if (smsVerification.verified) {
    return res.status(200).json({ message: '이미 인증번호가 인증 되었습니다.' });
  } else {
    // 인증시간을 초과했으면 인증하지 않음.
    if (Date.now() > smsVerification.expireAt)
      return res.status(400).json({ message: '유효기간이 지났습니다. 인증번호를 다시 발송해주세요.' });
    
    // 입력한 인증번호가 일치하지 않으면 인증하지 않음.
    if (cert_num !== smsVerification.answer)
      return res.status(400).json({ message: '인증번호가 다릅니다.' });

    // 인증시간 내에 인증 성공하면 인증 처리하여 세션에 저장.
    smsVerification = {
      ...smsVerification,
      verified: true
    };
    req.session.smsVerification = smsVerification;
    console.log(req.session.smsVerification);
    return res.status(200).json({ message: '인증되었습니다.' });
  }

  return res.status(200).json({ message: 'end of line' });
});

module.exports = router;