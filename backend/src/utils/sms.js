const CryptoJS = require('crypto-js');
const axios = require('axios');

// 네이버 SMS API 호출을 위해서 필요한 암호화된 서명을 생성하는 함수
function makeSignature(timestamp, suburl, method) {
	var space = " ";				// one space
	var newLine = "\n";				// new line
	var accessKey = process.env.NAVER_ACCESS_KEY;			// access key id (from portal or Sub Account)
	var secretKey = process.env.NAVER_SECRET_KEY;			// secret key (from portal or Sub Account)

	var hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
	hmac.update(method);
	hmac.update(space);
	hmac.update(suburl);
	hmac.update(newLine);
	hmac.update(timestamp);
	hmac.update(newLine);
	hmac.update(accessKey);

	var hash = hmac.finalize();
	return hash.toString(CryptoJS.enc.Base64);
}

// 휴대폰 인증이 성공적으로 되었는지를 반환하는 함수
function checkSMSVerification(req) {
	const { smsVerification } = req.session;
	if (!smsVerification) return false;
	return smsVerification.verified;
}

// 휴대폰 문자를 보내는 함수
async function sendSMS(smsData) {
	try {
		// 네이버 SMS API 호출을 위해 필요한 서명 생성
		const suburl = `/sms/v2/services/${process.env.NAVER_SERVICE_ID}/messages`;
		const method = 'POST';
		const timestamp = Date.now().toString();
		const signature = makeSignature(timestamp, suburl, method);

		// SMS API 호출
    await axios({
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
	} catch (err) {
		throw err;
	}
}

module.exports.makeSignature = makeSignature;
module.exports.checkSMSVerification = checkSMSVerification;
module.exports.sendSMS = sendSMS;