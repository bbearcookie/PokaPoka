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

// 토큰 유효성 검사. 성공시 payload 내용 반환
export const postTokenTest = () => axios.post(`${BACKEND}/api/auth/token/test`, undefined, options);

// 아이돌 그룹 목록 데이터 조회 요청
export const getAdminGroupList = () => axios.get(`${BACKEND}/api/admin/group/list`, options);

// 아이돌 그룹 데이터 작성 요청. 파일을 담아서 전송하는 방식인 multipart에서는 이처럼 데이터를 FormData에 담아서 보내줘야 함.
export const postAdminGroup = (form) => {
  let formData = new FormData();
  formData.append('name', form.name);
  formData.append('description', form.description);
  formData.append('gender', form.gender);
  formData.append('image', form.image.file);

  return axios.post(`${BACKEND}/api/admin/group`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

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