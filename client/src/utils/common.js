// 시간 값을 YYYY년 MM월 DD일 형태의 문자열로 반환
export const getFormattedDate = (date) => {
  date = new Date(date);

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  return `${year}년 ${month}월 ${day}일`;
}

// 시간 값을 YYYY년 MM월 DD일 HH시 MM분 SS초 형태의 문자열로 반환
export const getFormattedDateTime = (date) => {
  date = new Date(date);

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  return `${year}년 ${month}월 ${day}일 ${hours}시 ${minutes}분 ${seconds}초`;
}

// 시간 값을 HH시 MM분 SS초 형태의 문자열로 반환
export const getFormattedTime = (date) => {
  date = new Date(date);

  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();

  return `${hours}시 ${minutes}분 ${seconds}초`;
}