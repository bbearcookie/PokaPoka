import axios from 'axios';

export const BACKEND = 'http://localhost:5000'; // 백엔드 서버 주소
const options = { withCredentials: true }; // 여러 API 요청들이 공통적으로 사용할만한 옵션

// 로컬 로그인 요청
export const postLogin = (form) => axios.post(`${BACKEND}/api/auth/login/local`,
  {
    username: form.username,
    password: form.password
  },
  options
);

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

<<<<<<< HEAD

//아이디 찾기 시작
//백엔드 서버에 전화 번호 인증을 요청하는 기능
export const postVerified = (phone) => axios.post(`${BACKEND}/api/sms/sending`,
  { 
    phone: phone
  },
  options
);

//백엔드 서버에 전화 번호 인증 여부를 확인하는 기능
export const postVerifiedCheck = (verified) => axios.post(`${BACKEND}/api/sms/confirmation`,
  { 
    verified: verified
  },
  options
);

//백엔드 서버에 아이디 데이터를 요청하는 기능
export const getFindID = (name, phone) => axios.get(`${BACKEND}/finding/db2?name=${name}&phone=${phone}`,
  options
);
//아이디 찾기 끝
=======
// 로그인 검증 테스트
export const postLoginTest = () => axios.post(`${BACKEND}/api/auth/login/test`, undefined, options);
>>>>>>> c261bac878ec656c1703f593b18e00623b32971e
