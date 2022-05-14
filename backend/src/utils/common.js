// 변수가 비어져 있는지, 채워져 있는지의 여부를 반환함.
function isNull(value) {
  if (value === null) return true;
  if (value === undefined) return true;
  if (value === '') return true;
  if (value === 'undefined') return true; // URL params가 비어있는 경우에 undefined 라는 문자열로 받게 됨.
  if (value.length === 0) return true;
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

// DB SQL문에는 작은 따옴표를 '' 형태로 바꿔줘야 하는데 문자열의 모든 '를 ''로 변환하여 반환함.
function convertToMysqlStr(str) {
  if (isNull(str)) return "";

  return str.replace(/'/gi, "''");
}

// Javascript 배열 정보를 DB SQL문의 IN 에서 사용할만한 문자열로 변환함.
function convertToMysqlArr(arr) {
  return `${arr.join(',')}`;
}

// DB SQL문 사용시 필요한 조건이 담긴 배열을 WHERE절의 조건에 들어갈 부분의 문자열 형태로 반환함.
function getWhereClause(queries) {
  if (isNull(queries)) return '';

  let result = '';
  queries.forEach((element, i) => {
    if (i === 0) result += `WHERE ${element}`
    else result += ` AND ${element}`;
  });
  
  return result;
}

module.exports.isNull = isNull;
module.exports.convertToMysqlTime = convertToMysqlTime;
module.exports.convertToMysqlStr = convertToMysqlStr;
module.exports.convertToMysqlArr = convertToMysqlArr;
module.exports.getWhereClause = getWhereClause;