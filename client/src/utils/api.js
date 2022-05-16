import axios from 'axios';

// export const BACKEND = 'http://localhost:5000'; // 백엔드 서버 주소
export const BACKEND = process.env.REACT_APP_BACKEND_URI;
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

// 아이디 중복 확인 요청
export const getAuthUsername = (username) => axios.get(`${BACKEND}/api/auth/username/?username=${username}`, options);
// 회원가입 요청
export const postAuthSignup = (form) => axios.post(`${BACKEND}/api/auth/signup`,
  {
    username: form.username,
    password: form.password,
    password_check: form.password_check,
    name: form.name,
    nickname: form.nickname,
    favorite: form.favorite,
    phone: form.phone
  }, 
  options
);

// 아이돌 그룹 목록 데이터 조회 요청
export const getGroupList = () => axios.get(`${BACKEND}/api/group/list`, options);
// 아이돌 그룹 상세 데이터 조회 요청
export const getGroupDetail = (groupId) => axios.get(`${BACKEND}/api/group/detail/${groupId}`, options);
// 아이돌 그룹 데이터 삭제 요청
export const deleteGroup = (groupId) => axios.delete(`${BACKEND}/api/group/${groupId}`, options);
// 아이돌 그룹 데이터 작성 요청. 파일을 담아서 전송하는 방식인 multipart에서는 이처럼 데이터를 FormData에 담아서 보내줘야 함.
export const postGroup = (form) => {
  let formData = new FormData();
  formData.append('name', form.name);
  formData.append('description', form.description);
  formData.append('gender', form.gender);
  formData.append('image', form.image.file);

  return axios.post(`${BACKEND}/api/group`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}
// 아이돌 그룹 데이터 수정 요청
export const putGroup = (form, groupId) => {
  let formData = new FormData();
  formData.append('name', form.name);
  formData.append('description', form.description);
  formData.append('gender', form.gender);
  formData.append('image', form.image.file);

  return axios.put(`${BACKEND}/api/group/${groupId}`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

// 아이돌 멤버 목록 데이터 조회 요청
export const getAllMemberList = () => axios.get(`${BACKEND}/api/member/list`, options);
export const getMemberList = (groupId) => axios.get(`${BACKEND}/api/member/list/${groupId}`, options);
// 아이돌 멤버 상세 데이터 조회 요청
export const getMemberDetail = (memberId) => axios.get(`${BACKEND}/api/member/detail/${memberId}`, options);
// 아이돌 멤버 데이터 삭제 요청
export const deleteMember = (memberId) => axios.delete(`${BACKEND}/api/member/${memberId}`, options);
// 아이돌 멤버 데이터 작성 요청
export const postMember = (form, groupId) => {
  let formData = new FormData();
  formData.append('groupId', groupId);
  formData.append('name', form.name);
  formData.append('image', form.image.file);

  return axios.post(`${BACKEND}/api/member`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}
// 아이돌 멤버 데이터 수정 요청
export const putMember = (form, memberId) => {
  let formData = new FormData();
  formData.append('name', form.name);
  formData.append('image', form.image.file);

  return axios.put(`${BACKEND}/api/member/${memberId}`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

// 앨범 목록 데이터 조회 요청
export const getAllAlbumList = () => axios.get(`${BACKEND}/api/album/list`, options);
export const getAlbumList = (groupId) => axios.get(`${BACKEND}/api/album/list/${groupId}`, options);
// 앨범 상세 데이터 조회 요청
export const getAlbumDetail = (albumId) => axios.get(`${BACKEND}/api/album/detail/${albumId}`, options);
// 앨범 데이터 삭제 요청
export const deleteAlbum = (albumId) => axios.delete(`${BACKEND}/api/album/${albumId}`, options);
// 앨범 데이터 등록 요청
export const postAlbum = (form, groupId) => {
  let formData = new FormData();
  formData.append('groupId', groupId);
  formData.append('name', form.name);
  formData.append('image', form.image.file);

  return axios.post(`${BACKEND}/api/album`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}
// 앨범 데이터 수정 요청
export const putAlbum = (form, albumId) => {
  let formData = new FormData();
  formData.append('name', form.name);
  formData.append('image', form.image.file);

  return axios.put(`${BACKEND}/api/album/${albumId}`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}

// 포토카드 데이터 목록 조회 요청
export const getPhotocardList = (groupId, memberId) => axios.get(
  `${BACKEND}/api/photocard/list?groupId=${groupId}&memberId=${memberId}`,
  options
);
// 포토카드 데이터 상세 조회 요청
export const getPhotocardDetail = (photocardId) => axios.get(`${BACKEND}/api/photocard/detail/${photocardId}`, options);
// 포토카드 데이터 삭제 요청
export const deletePhotocard = (photocardId) => axios.delete(`${BACKEND}/api/photocard/${photocardId}`, options);
// 포토카드 데이터 등록 요청
export const postPhotocard = (form) => {
  let formData = new FormData();
  formData.append('groupId', form.group.id);
  formData.append('memberId', form.member.id);
  formData.append('albumId', form.album.id);
  formData.append('name', form.name);
  formData.append('image', form.image.file);

  return axios.post(`${BACKEND}/api/photocard`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}
// 포토카드 데이터 수정 요청
export const putPhotocard = (form, photocardId) => {
  let formData = new FormData();
  formData.append('groupId', form.group.id);
  formData.append('memberId', form.member.id);
  formData.append('albumId', form.album.id);
  formData.append('name', form.name);
  formData.append('image', form.image.file);

  return axios.put(`${BACKEND}/api/photocard/${photocardId}`, formData,
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
// 인증 번호 세션 초기화
export const deleteSmsSession = () => axios.delete(`${BACKEND}/api/sms/session`, options);
//비밀번호 변경
export const postPassword = (password, password_check) => axios.post(`${BACKEND}/api/sms/password`,
  {
    password: password,
    password_check: password_check
  },
  options
);

// 문의사항 목록 데이터 조회 요청
export const getSuggestionList = () => axios.get(`${BACKEND}/api/suggestion/list`, options);
// 문의사항 상세 데이터 조회 요청
export const getSuggestionDetail = (suggestionId) => axios.get(`${BACKEND}/api/suggestion/viewing/${suggestionId}`, options);
// 문의사항 삭제 요헝
export const deleteSuggestion = (suggestionId) => axios.delete(`${BACKEND}/api/suggestion/${suggestionId}`, options);
// 문의사항 데이터 작성 요청
export const postSuggestion = (form) => axios.post(`${BACKEND}/api/suggestion/new`,
  {
    title: form.title,
    content: form.content,
    category: form.category
  },
  options
);
// 문의사항 답변 데이터 작성 요청
export const postReply = (reply, suggestionId) => axios.post(`${BACKEND}/api/suggestion/reply/${suggestionId}`,
  {
    content: reply.reply
  },
  options
);

// 공지사항 목록 데이터 조회 요청
export const getNoticeList = () => axios.get(`${BACKEND}/api/notice/noticeList`, options);
// 공지사항 상세 데이터 조회 요청
export const getNoticeDetail = (noticeId) => axios.get(`${BACKEND}/api/notice/detail/${noticeId}`, options);
// 공지사항 삭제 요헝
export const deleteNotice = (noticeId) => axios.delete(`${BACKEND}/api/notice/admin/${noticeId}`, options);
// 공지사항 데이터 작성 요청
export const postNotice = (form) => axios.post(`${BACKEND}/api/notice/admin/new`,
  {
    title: form.title,
    content: form.content
  },
  options
);
// 공지사항 데이터 수정 요청
export const putNotice = (form, noticeId) => axios.put(`${BACKEND}/api/notice/admin/${noticeId}`,
{
  title: form.title,
  content: form.content
},
options
);

// 사용자-자신이 작성한 포토카드 소유권 발급 요청 목록 조회
export const getVoucherRequestListMine = () => axios.get(`${BACKEND}/api/voucher/request/list/mine`, options);
// 관리자-모든 포토카드 소유권 발급 요청 목록 조회
export const getVoucherRequestListAll = () => axios.get(`${BACKEND}/api/voucher/request/list/all`, options);
// 관리자-모든 포토카드 소유권 발급 목록 조회
export const getVoucherProvisionListAll = () => axios.get(`${BACKEND}/api/voucher/provision/list/all`, options);
// 포토카드 소유권 발급 요청 상세 조회
export const getVoucherRequestDetail = (requestId) => axios.get(`${BACKEND}/api/voucher/request/detail/${requestId}`, options);
// 포토카드 소유권 요청 삭제 요청
export const deleteVoucherRequest = (requestId) => axios.delete(`${BACKEND}/api/voucher/request/${requestId}`, options);
// 사용자가 포토카드 소유권 발급 요청
export const postVoucherRequest = (form) => {
  let formData = new FormData();
  formData.append('delivery', form.delivery);
  formData.append('trackingNumber', form.trackingNumber);
  formData.append('photocardId', form.photocardId);
  formData.append('image', form.image.file);

  return axios.post(`${BACKEND}/api/voucher/request`, formData,
  { ...options, headers: { 'Content-Type': 'multipart/form-data' } }
  );
}
// 관리자가 포토카드 소유권 발급
export const postVoucherProvisionNew = (form) => axios.post(`${BACKEND}/api/voucher/provision/new`,
  {
    recipient: form.recipient,
    permanent: form.permanent,
    photocardId: form.photocardId
  },
  options
);

// 관리자가 기존의 포토카드 소유권 요청 정보를 가지고 임시 소유권 발급
export const postVoucherProvisionByRequest = (requestId) => axios.post(`${BACKEND}/api/voucher/provision/request`,
  {
    requestId: requestId,
  },
  options
);

// 관리자가 포토카드 임시 소유권 발급 취소
export const postVoucherRevert = (requestId) => axios.post(`${BACKEND}/api/voucher/revert/${requestId}`,
{}, options);

// 임시 소유권을 영구 소유권으로 전환
export const putVoucherProvisionByRequest = (requestId) => axios.put(`${BACKEND}/api/voucher/provision/request`,
  {
    requestId: requestId,
  },
  options
);

//사용자 회원정보 조회
export const getUserInfo = () => axios.get(`${BACKEND}/api/user/mypage`, options);
//사용자 회원정보 수정
export const putUserInfo = (form) => axios.put(`${BACKEND}/api/user/mypage/edit`,
  {
    name: form.name,
    phone: form.phone,
    nickname: form.nickname,
    favorite: form.favorite
  }, 
  options
);
//사용자 탈퇴 요청
export const patchUser = (state) => axios.patch(`${BACKEND}/api/user/withdrawal/request`, 
  {
    withdrawal: state.withdrawal
  }, 
  options
);
//사용자 탈퇴 취소 요청
export const patchUserCancel = (state) => axios.patch(`${BACKEND}/api/user/withdrawal/request`, 
  {
    withdrawal: state.normal
  }, 
  options
);
//관리자 - 회원 목록 조회
export const getUserList = () => axios.get(`${BACKEND}/api/admin/user/list`, options);
//관리자 - 탈퇴요청한, 비활성화된 사용자 조회
export const getSelectUserList = (keword) => axios.get(`${BACKEND}/api/admin/user/selectList?keword=${keword}`, options);
//관리자 - 회원 정보 상세 조회
export const getUserDetail = (username) => axios.get(`${BACKEND}/api/admin/user/detail/${username}`, options);
//관리자 - 키워드 검색 조회
export const getUserListSearch = (username) => axios.get(`${BACKEND}/api/admin/user/search/${username}`, options);
//관리자 - 사용자 비활성화
export const patchInactive = (state, username) => axios.patch(`${BACKEND}/api/admin/user/inactive/${username}`, 
  {
    inactive: state.inactive
  }, 
  options
);
//관리자 - 사용자 비활성화 취소
export const patchInactiveCancel = (state, username) => axios.patch(`${BACKEND}/api/admin/user/inactive/${username}`, 
  {
    inactive: state.normal
  }, 
  options
);
// 관리자 - 회원 탈퇴
export const deleteUser = (username) => axios.delete(`${BACKEND}/api/admin/user/withdrawal/${username}`, options);
// 모든 사용자 목록 조회 요청
export const getUserListAll = (filter) => axios.get(
  `${BACKEND}/api/user/list/all?` +
  `username=${filter.username}` ,
  options
);

// 사용자가 소유한 포토카드 소유권 목록 조회
// permanent: (0이면 임시소유권, 1이면 정식소유권 조회)
// state: (initial이면 거래 안된 소유권, traded이면 한 번이라도 거래 된 소유권 조회)
// groupId, memberId: (특정 그룹이나 멤버에 대한 소유권만 조회)
export const getVoucherListMine = (filter) => axios.get(
  `${BACKEND}/api/voucher/list/mine?` +
  `permanent=${filter.permanent}&` +
  `state=${filter.state}&` + 
  `groupId=${filter.groupId}&` +
  `memberId=${filter.memberId}`,
  options
);

// 교환글 등록 요청
export const postTradeNew = (form) => axios.post(`${BACKEND}/api/trade/new`,
  {
    permanent: form.permanent,
    haveVoucherId: form.haveVoucherId,
    wantPhotocards: form.wantPhotocards.map(element => element.photocard_id),
    wantAmount: form.wantAmount
  },
  options
);

// 교환글 수정 요청
export const putTrade = (form, tradeId) => axios.put(`${BACKEND}/api/trade/${tradeId}`,
  {
    permanent: form.permanent,
    haveVoucherId: form.haveVoucherId,
    wantPhotocards: form.wantPhotocards.map(element => element.photocard_id),
    wantAmount: form.wantAmount
  },
  options
);

// 특정 교환글 삭제 요청
export const deleteTrade = (tradeId) => axios.delete(`${BACKEND}/api/trade/${tradeId}`, options);

// 모든 교환글 목록 조회 요청
export const getTradeListAll = (filter) => axios.get(
  `${BACKEND}/api/trade/list/all?` +
  `groupId=${filter.groupId}&` +
  `memberId=${filter.memberId}&` +
  `albumId=${filter.albumId}&` +
  `state=${filter.state}&` +
  `username=${filter.username}` ,
  options
);

// 내가 찜한 교환글 목록 조회 요청
export const getTradeListFavorite = () => axios.get(`${BACKEND}/api/trade/list/favorite`, options);

// 교환글 상세 조회 요청
export const getTradeDetail = (tradeId) => axios.get(`${BACKEND}/api/trade/detail/${tradeId}`);

// 해당 교환글에게 교환 신청
export const postTradeTransaction = (form, tradeId) => axios.post(`${BACKEND}/api/trade/transaction/${tradeId}`,
  {
    useVouchers: form.useVouchers.map(element => element.voucher_id)
  },
  options
);

// 매칭 가능한 교환글이 있는지 탐색 요청
export const getTradeExplore = (haveVoucherId, wantPhotocardId) => axios.get(
  `${BACKEND}/api/trade/explore?haveVoucherId=${haveVoucherId}&wantPhotocardId=${wantPhotocardId}`,
  options
);

// 탐색 했던 정보를 가지고 교환 요청
export const postTradeExplore = (haveVoucher, trades) => axios.post(`${BACKEND}/api/trade/explore`, 
  {
    haveVoucher: haveVoucher,
    trades: trades
  },
  options
);

// 해당 교환글에게 찜하기 요청
export const postTradeFavorite = (tradeId) => axios.post(`${BACKEND}/api/trade/favorite/${tradeId}`, {}, options);

// 해당 교환글이 원하는 포토카드 중에서 자신이 가지고 있는 소유권 목록 조회
export const getTradeWantcardMine = (tradeId) => axios.get(`${BACKEND}/api/trade/wantcard/mine/${tradeId}`, options);

// 사용자가 보냈던 포토카드 교환 내역 조회
export const getTradeHistoryProvision = () => axios.get(`${BACKEND}/api/trade/history/provision`, options);

// 사용자가 받았던 포토카드 교환 내역 조회
export const getTradeHistoryReceipt = () => axios.get(`${BACKEND}/api/trade/history/receipt`, options);

// shippingCtrl
// 마이페이지 배송 정보 조회
export const getAddress = () => axios.get(`${BACKEND}/api/shipping/deliveryInfo`, options);
// 배송 주소 입력
export const putAddress = (form) => axios.put(`${BACKEND}/api/shipping/addressUpdate`,
  {
    address: form.address,
    address_detail: form.address_detail
  }, 
  options
);
// 배송요청 상세 데이터 조회 요청
export const getShippingDetail = (requestId) => axios.get(`${BACKEND}/api/shipping/detail/${requestId}`, options);
// 관리자 -  배송요청 상세 데이터 조회 요청
export const getShippingDetailAdmin = (requestId) => axios.get(`${BACKEND}/api/admin/shipping/detail/${requestId}`, options);
//ShippingWant에 데이터 등록
export const postShippingWant = (vouchers, merchant_uid) => axios.post(`${BACKEND}/api/shipping/mypage/voucher`,
  {
    useVouchers: vouchers.useVouchers.map(element => element.voucher_id),
    merchant_uid: merchant_uid
  },
  options
);
// 배송 요청 리스트
export const getShippingRequestList = () => axios.get(`${BACKEND}/api/shipping/list`, options);
// 사용자 -  배송요청 소유권
export const getShippingRequestVoucher = (filter) => axios.get(
  `${BACKEND}/api/shipping/request/voucher/mine?` +
  `permanent=${filter.permanent}&` +
  `state=${filter.state}&` + 
  `groupId=${filter.groupId}&` +
  `memberId=${filter.memberId}&`+
  `username=${filter.username}`,
  options
);
// 관리자 -  배송요청 소유권
export const getShippingVoucherListMine = (filter) => axios.get(
  `${BACKEND}/api/shipping/voucher/mine?` +
  `permanent=${filter.permanent}&` +
  `state=${filter.state}&` + 
  `groupId=${filter.groupId}&` +
  `memberId=${filter.memberId}&`+
  `username=${filter.username}`,
  options
);
// 관리자 배송 요청 처리
export const postSetState = (requestId) => axios.post(`${BACKEND}/api/shipping/state/${requestId}`, {}, options);
// 관리자-모든 포토카드 배송 내역 조회
export const getShippingProvisionListAll = () => axios.get(`${BACKEND}/api/shipping/provision`, options);
// paymentCtrl
// 백엔드 서버에 거래 데이터 생성 요청
export const postPayment = (payment, vouchers) => axios.post(`${BACKEND}/api/payment/mypage/request`,
  {
    payment,
    useVouchers: vouchers.useVouchers.map(element => element.voucher_id)
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