import { useEffect, useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthContext from './contexts/Auth';
import { STORAGE_KEY_NAME } from './contexts/Auth';
import IndexPage from './pages/IndexPage';
import TestPage from './pages/TestPage';
import SocialLoginTestPage from './pages/SocialLoginTestPage';
import LoginPage from './pages/LoginPage';
import LoginSuccessPage from './pages/LoginSuccessPage';
import AdminMainPage from './pages/admin/MainPage';
import GroupListPage from './pages/admin/group/GroupListPage';
import GroupDetailPage from './pages/admin/group/GroupDetailPage';
import GroupWriterPage from './pages/admin/group/GroupWriterPage';
import MemberWriterPage from './pages/admin/member/MemberWriterPage';
import MemberDetailPage from './pages/admin/member/MemberDetailPage';
import AlbumWriterPage from './pages/admin/album/AlbumWriterPage';
import AlbumDetailPage from './pages/admin/album/AlbumDetailPage';
import PhotocardListPage from './pages/admin/photocard/PhotocardListPage';
import PhotocardWriterPage from './pages/admin/photocard/PhotocardWriterPage';
import PhotocardDetailPage from './pages/admin/photocard/PhotocardDetailPage';
import SignupPage from './pages/SignupPage';
import UsernamePage from './pages/UsernamePage';
import PasswordPage from './pages/find_password/PwPage';
import SignupCompletePage from './pages/SignupCompletePage';
import PwChangePage from './pages/find_password/PwChangePage';
import ManagerLoginPage from './pages/ManagerLoginPage';
import CertificationPage from './pages/find_password/CertificationPage';
import UserMainPage from './pages/MainPage';
import SuggestionListPage from './pages/admin/suggestion/SuggestionListPage';
import SuggestionDetailPage from './pages/admin/suggestion/SuggestionDetailPage';
import NoticeListPage from './pages/admin/notice/NoticeListPage';
import NoticeDetailPage from './pages/admin/notice/NoticeDetailPage';
import NoticeDetailUserPage from './pages/NoticeDetailUserPage';
import NoticeWriterPage from './pages/admin/notice/NoticeWriterPage';
import AdminVoucherRequestListPage from './pages/admin/voucher/VoucherRequestListPage';
import AdminVoucherRequestDetailPage from './pages/admin/voucher/VoucherRequestDetailPage';
import VoucherProvisionWriter from './pages/admin/voucher/VoucherProvisionWriter';
import VoucherRequestListPage from './pages/mypage/voucher_request/VoucherRequestListPage';
import VoucherRequestWriterPage from './pages/mypage/voucher_request/VoucherRequestWriterPage';
import SuggestionRequestListPage from './pages/mypage/SuggestionRequestList';
import SuggestionWriterPage from './pages/mypage/SuggestionWriterPage';
import SuggestionRequestDetailPage from './pages/mypage/SuggestionRequestDetailPage';
import ChangeLetterListPage from './pages/mypage/ChangeLetterListPage';
import ChangeLetterWritePage from './pages/mypage/ChangeLetterWritePage';
import ChangeLetterCorrectPage from './pages/mypage/ChangeLetterCorrectPage';
import DeliveryInfoPage from './pages/mypage/DeliveryInfoPage';
import EditUserPage from './pages/mypage/EditUserPage';
import UserInfoPage from './pages/mypage/UserInfoPage';
import AskingPage from './pages/mypage/AskingPage';
import VoucherProvisionListPage from './pages/admin/voucher/VoucherProvisionList';
import UserListPage from './pages/admin/user/UserListPage';
import WithdrawalUserListPage from './pages/admin/user/WithdrawalUserListPage';
import InactiveUserListPage from './pages/admin/user/InactiveUserListPage';
import UserDetailPage from './pages/admin/user/UserDetailPage';

function App() {
  const { state: authState, actions: authActions } = useContext(AuthContext);

  // 페이지 로드시 동작. 새로고침이나 직접 URL 입력해서 접근한 경우 상태 값이 지워지는데,
  // 세션 스토리지에 기억된 사용자의 로그인 정보가 있다면 그 값으로 상태를 업데이트함.
  const onLoad = async () => {
    try {
      if (!authState.user) {
        const user = sessionStorage.getItem(STORAGE_KEY_NAME);
        if (user) authActions.login(JSON.parse(user));
      }
    } catch (err) {}
  }
  useEffect(() => { onLoad(); }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<IndexPage /> } />
        
        <Route path="/main" element={<UserMainPage /> } />
        <Route path="/main/notice/detail/:noticeId" element={<NoticeDetailUserPage />}/>

        <Route path="/test" element={<TestPage />} />
        <Route path="/social" element={<SocialLoginTestPage />} />

        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/login/success" element={<LoginSuccessPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/signupcomplete" element={<SignupCompletePage />} />
        <Route path="/auth/signupcomplete" element={<SignupCompletePage />} />
        <Route path="/auth/managerlogin" element={<ManagerLoginPage />}/>

        <Route path="/admin" element={<AdminMainPage />} />
        <Route path="/admin/group" element={<GroupListPage />} />
        <Route path="/admin/group/writer" element={<GroupWriterPage />} />
        <Route path="/admin/group/writer/:groupId" element={<GroupWriterPage />} />
        <Route path="/admin/group/detail/:groupId" element={<GroupDetailPage />} />
        <Route path="/admin/member/writer" element={<MemberWriterPage />} />
        <Route path="/admin/member/writer/:memberId" element={<MemberWriterPage />} />
        <Route path="/admin/member/detail/:memberId" element={<MemberDetailPage />} />
        <Route path="/admin/album/writer" element={<AlbumWriterPage />} />
        <Route path="/admin/album/writer/:albumId" element={<AlbumWriterPage />} />
        <Route path="/admin/album/detail/:albumId" element={<AlbumDetailPage />} />
        <Route path="/admin/photocard" element={<PhotocardListPage />} />
        <Route path="/admin/photocard/writer" element={<PhotocardWriterPage />} />
        <Route path="/admin/photocard/writer/:photocardId" element={<PhotocardWriterPage />} />
        <Route path="/admin/photocard/detail/:photocardId" element={<PhotocardDetailPage />} />
        <Route path="/admin/suggestion" element={<SuggestionListPage />}/>
        <Route path="/admin/suggestion/detail/:suggestionId" element={<SuggestionDetailPage />}/>
        <Route path="/admin/voucher/request" element={<AdminVoucherRequestListPage />}/>
        <Route path="/admin/voucher/request/detail/:requestId" element={<AdminVoucherRequestDetailPage />}/>
        <Route path="/admin/voucher/provision" element={<VoucherProvisionListPage />}/>
        <Route path="/admin/voucher/provision/writer" element={<VoucherProvisionWriter />}/>
        <Route path="/admin/voucher/provision/writer/:requestId" element={<VoucherProvisionWriter />}/>
        <Route path="/admin/notice" element={<NoticeListPage />}/>
        <Route path="/admin/notice/detail/:noticeId" element={<NoticeDetailPage />}/>
        <Route path="/admin/notice/writer" element={<NoticeWriterPage />}/>
        <Route path="/admin/notice/writer/:noticeId" element={<NoticeWriterPage />}/>
        <Route path="/admin/user" element={<UserListPage />}/>
        <Route path="/admin/user/withdrawal" element={<WithdrawalUserListPage />}/>
        <Route path="/admin/user/inactive" element={<InactiveUserListPage />}/>
        <Route path="/admin/user/detail/:username" element={<UserDetailPage />}/>

        <Route path="/finding/password" element={<PasswordPage />} />
        <Route path="/finding/pwchange" element={<PwChangePage />}/>
        <Route path="/finding/username" element={<UsernamePage />} />
        <Route path="/finding/sms" element={<CertificationPage />}/>
      
        <Route path="/mypage/voucher" element={<VoucherRequestListPage />}/>
        <Route path="/mypage/voucher/writer" element={<VoucherRequestWriterPage />}/>
        <Route path="/mypage/voucher/writer/:voucherId" element={<VoucherRequestWriterPage />}/>
        <Route path="/mypage/suggestion" element={<SuggestionRequestListPage />}/>
        <Route path="/mypage/suggestion/writer" element={<SuggestionWriterPage />}/>
        <Route path="/mypage/suggestion/detail/:suggestionId" element={<SuggestionRequestDetailPage />}/>
        <Route path="/mypage/changeletterlist" element={<ChangeLetterListPage />}/>
        <Route path="/mypage/changeletterwrite" element={<ChangeLetterWritePage />}/>
        <Route path="/mypage/changelettercorrect" element={<ChangeLetterCorrectPage />}/>
        <Route path="/mypage/deliveryinfo" element={<DeliveryInfoPage />}/>
        <Route path="/mypage/editUserInfo" element={<EditUserPage />}/>
        <Route path="/mypage/userInfo" element={<UserInfoPage />}/>
        <Route path="/mypage/asking" element={<AskingPage />}/>
      </Routes>
    </div>
  );
}

export default App;
