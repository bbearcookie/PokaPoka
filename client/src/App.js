import { useEffect, useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthContext from './contexts/Auth';
import { STORAGE_KEY_NAME } from './contexts/Auth';
import IndexPage from './pages/IndexPage';
import TestPage from './pages/TestPage';
import SocialLoginTestPage from './pages/SocialLoginTestPage';
import LoginPage from './pages/LoginPage';
import LoginSuccessPage from './pages/LoginSuccessPage';
import MainPage from './pages/admin/MainPage';
import GroupListPage from './pages/admin/group/GroupListPage';
import GroupDetailPage from './pages/admin/group/GroupDetailPage';
import GroupWriterPage from './pages/admin/group/GroupWriterPage';
import MemberWriterPage from './pages/admin/member/MemberWriterPage';
import MemberDetailPage from './pages/admin/member/MemberDetailPage';
import AlbumWriterPage from './pages/admin/album/AlbumWriterPage';
import AlbumDetailPage from './pages/admin/album/AlbumDetailPage';
import PhotocardListPage from './pages/admin/photocard/PhotocardListPage';
import PhotocardWriterPage from './pages/admin/photocard/PhotocardWriterPage';
import SignupPage from './pages/SignupPage';
import UsernamePage from './pages/UsernamePage';
import PasswordPage from './pages/find_password/PwPage';
import SignupCompletePage from './pages/SignupCompletePage';
import PwChangePage from './pages/find_password/PwChangePage';
import ManagerLoginPage from './pages/ManagerLoginPage';
import CertificationPage from './pages/find_password/CertificationPage';

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
        <Route path="/test" element={<TestPage />} />
        <Route path="/social" element={<SocialLoginTestPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/login/success" element={<LoginSuccessPage />} />
        <Route path="/admin" element={<MainPage />} />
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
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/finding/password" element={<PasswordPage />} />
        <Route path="/finding/username" element={<UsernamePage />} />
        <Route path="/auth/signupcomplete" element={<SignupCompletePage />} />
        <Route path="/finding/pwchange" element={<PwChangePage />}/>
        <Route path="/auth/signupcomplete" element={<SignupCompletePage />} />
        <Route path="/auth/managerlogin" element={<ManagerLoginPage />}/>
        <Route path="/finding/sms" element={<CertificationPage />}/>
      </Routes>
    </div>
  );
}

export default App;
