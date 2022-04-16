import axios from 'axios';

export const BACKEND = 'http://localhost:5000'; // 백엔드 서버 주소
const options = { withCredentials: true }; // 여러 API 요청들이 공통적으로 사용할만한 옵션

// 로그아웃 요청
export const postLogout = () => axios.post(`${BACKEND}/api/auth/logout`, undefined, options);

// 백엔드 서버에 DB에 데이터 추가하는 요청 테스트 기능
export const postTestDB = (text, author) => axios.post(`${BACKEND}/test/db`,
  { 
    text: text,
    author: author
  },
  options
);

// 백엔드 서버에 데이터 요청하는 테스트 기능
export const getTestDB = () => axios.get(`${BACKEND}/test/db`, options);

// 로그인 검증 테스트
export const postLoginTest = () => axios.post(`${BACKEND}/api/auth/login/test`, undefined, options);