// 변수가 비어져 있는지, 채워져 있는지의 여부를 반환함.
function isNull(value) {
  if (value === null) return true;
  if (value === undefined) return true;
  if (value === 'undefined') return true; // URL params가 비어있는 경우에 undefined 라는 문자열로 받게 됨.
  return false;
}

module.exports.isNull = isNull;