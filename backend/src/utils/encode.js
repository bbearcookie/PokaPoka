// JSON 형태의 데이터를 application/x-www-form-urlencoded 요청에 필요한 쿼리 데이터 형태로 변환함.
function getURIEncode(data) {
  return Object.keys(data)
  .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
  .join('&');
}

module.exports.getURIEncode = getURIEncode;