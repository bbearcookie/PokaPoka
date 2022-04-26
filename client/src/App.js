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
import GroupListPage from './pages/admin/GroupListPage';
import GroupDetailPage from './pages/admin/GroupDetailPage';
import GroupWriterPage from './pages/admin/GroupWriterPage';

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
      </Routes>
    </div>
  );
}

export default App;
