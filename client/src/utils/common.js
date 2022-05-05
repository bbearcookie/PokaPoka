// 시간 값을 YYYY년 MM월 DD일 형태의 문자열로 반환
export const getFormattedDate = (date) => {
  date = new Date(date);

  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  return `${year}년 ${month}월 ${day}일`;
}