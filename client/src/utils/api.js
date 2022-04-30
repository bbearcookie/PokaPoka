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
// 아이돌 그룹 상세 데이터 조회 요청
export const getAdminGroupDetail = (groupId) => axios.get(`${BACKEND}/api/admin/group/detail/${groupId}`, options);
// 아이돌 그룹 데이터 삭제 요청
export const deleteAdminGroup = (groupId) => axios.delete(`${BACKEND}/api/admin/group/${groupId}`, options);
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
// 아이돌 그룹 데이터 수정 요청
export const putAdminGroup = (form, groupId) => {
  let formData = new FormData();
  formData.append('name', form.name);
  formData.append('description', form.description);
  formData.append('gender', form.gender);
  formData.append('image', form.image.file);

  return axios.put(`${BACKEND}/api/admin/group/${groupId}`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

// 아이돌 멤버 목록 데이터 조회 요청
export const getAdminAllMemberList = () => axios.get(`${BACKEND}/api/admin/member/list`, options);
export const getAdminMemberList = (groupId) => axios.get(`${BACKEND}/api/admin/member/list/${groupId}`, options);
// 아이돌 멤버 상세 데이터 조회 요청
export const getAdminMemberDetail = (memberId) => axios.get(`${BACKEND}/api/admin/member/detail/${memberId}`, options);
// 아이돌 멤버 데이터 삭제 요청
export const deleteAdminMember = (memberId) => axios.delete(`${BACKEND}/api/admin/member/${memberId}`, options);
// 아이돌 멤버 데이터 작성 요청
export const postAdminMember = (form, groupId) => {
  let formData = new FormData();
  formData.append('groupId', groupId);
  formData.append('name', form.name);
  formData.append('image', form.image.file);

  return axios.post(`${BACKEND}/api/admin/member`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}
// 아이돌 멤버 데이터 수정 요청
export const putAdminMember = (form, memberId) => {
  let formData = new FormData();
  formData.append('name', form.name);
  formData.append('image', form.image.file);

  return axios.put(`${BACKEND}/api/admin/member/${memberId}`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

// 앨범 목록 데이터 조회 요청
export const getAdminAlbumList = (groupId) => axios.get(`${BACKEND}/api/admin/album/list/${groupId}`, options);
// 앨범 상세 데이터 조회 요청
export const getAdminAlbumDetail = (albumId) => axios.get(`${BACKEND}/api/admin/album/detail/${albumId}`, options);
// 앨범 데이터 삭제 요청
export const deleteAdminAlbum = (albumId) => axios.delete(`${BACKEND}/api/admin/album/${albumId}`, options);
// 앨범 데이터 등록 요청
export const postAdminAlbum = (form, groupId) => {
  let formData = new FormData();
  formData.append('groupId', groupId);
  formData.append('name', form.name);
  formData.append('image', form.image.file);

  return axios.post(`${BACKEND}/api/admin/album`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}
// 앨범 데이터 수정 요청
export const putAdminAlbum = (form, albumId) => {
  let formData = new FormData();
  formData.append('name', form.name);
  formData.append('image', form.image.file);

  return axios.put(`${BACKEND}/api/admin/album/${albumId}`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

// 포토카드 데이터 조회 요청
export const getAdminPhotocardList = (groupId, memberId) => axios.get(
  `${BACKEND}/api/admin/photocard/list?groupId=${groupId}&memberId=${memberId}`,
  options
);
// 포토카드 데이터 등록 요청
export const postAdminPhotocard = (form, groupId, memberId, albumId) => {
  let formData = new FormData();
  formData.append('groupId', form.group.id);
  formData.append('memberId', form.member.id);
  formData.append('albumId', form.album.id);
  formData.append('name', form.name);
  formData.append('image', form.image.file);

  return axios.post(`${BACKEND}/api/admin/photocard`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

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