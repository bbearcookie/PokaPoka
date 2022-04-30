// 변수가 비어져 있는지, 채워져 있는지의 여부를 반환함.
function isNull(value) {
  if (value === null) return true;
  if (value === undefined) return true;
  if (value === 'undefined') return true; // URL params가 비어있는 경우에 undefined 라는 문자열로 받게 됨.
  return false;
}

// JS에서의 시간 형태를 mysql에서의 시간 형태로 변환하는 함수
function convertToMysqlTime(date) {
  return date.getUTCFullYear() + '-' +
      ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
      ('00' + date.getUTCDate()).slice(-2) + ' ' + 
      ('00' + date.getUTCHours()).slice(-2) + ':' + 
      ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
      ('00' + date.getUTCSeconds()).slice(-2);
};

module.exports.isNull = isNull;
module.exports.convertToMysqlTime = convertToMysqlTime;