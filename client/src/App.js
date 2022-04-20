import { useEffect, useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import AuthContext from './contexts/Auth';
import useRequest from './utils/useRequest';
import * as api from './utils/api';
import IndexPage from './pages/IndexPage';
import TestPage from './pages/TestPage';
import SocialLoginTestPage from './pages/SocialLoginTestPage';
import LoginPage from './pages/LoginPage';
import LoginSuccessPage from './pages/LoginSuccessPage';

function App() {
  const { state: authState, actions: authActions } = useContext(AuthContext);
  const request = useRequest();

  const onLoad = async () => {
    try {
      const res = await request.call(api.postTokenTest);
      authActions.login(res);
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
      </Routes>
    </div>
  );
}

export default App;
