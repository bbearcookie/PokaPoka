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

//아이디 찾기
export const getUsername = (name, phone) => axios.get(`${BACKEND}/api/finding/username?name=${name}&phone=${phone}`, options);

//비밀 번호 변경시 아이디가 맞는지 확인
export const postIdCheck = (username, name, phone) => axios.post(`${BACKEND}/api/finding/id_check`,
  {
    username: username,
    name: name,
    phone: phone
  },
  options
);

//인증 번호 생성하여 휴대폰 번호에 발송
export const postSending = (phone) => axios.post(`${BACKEND}/api/sms/sending`,
  {
    phone: phone
  },
  options
);

//인증 번호가 맞는지 확인
export const postConfirmation = (cert_num) => axios.post(`${BACKEND}/api/sms/confirmation`,
  {
    cert_num: cert_num
  },
  options
);

//비밀번호 변경
export const postPassword = (password, password_check) => axios.post(`${BACKEND}/api/sms/password`,
  {
    password: password,
    password_check: password_check
  },
  options
);

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