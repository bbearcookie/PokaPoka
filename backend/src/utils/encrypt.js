const crypto = require('crypto');

// 32자리의 소문자+숫자 랜덤 스트링을 반환하는 함수. 주로 암호화키의 생성을 위한 salt값 생성에 사용된다.
function makeSalt() {
  return crypto.randomBytes(32).toString('hex');
}

// plainText를 salt값을 키로 암호화 하여 반환함.
function encryptText(plainText, salt) {
  const encryptedText = crypto.pbkdf2Sync(plainText, salt, 51234, 32, "sha512").toString('hex');
  return encryptedText;
}

module.exports.makeSalt = makeSalt;
module.exports.encryptText = encryptText;