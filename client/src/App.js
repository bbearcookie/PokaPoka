import { Route, Routes } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import TestPage from './pages/TestPage';
import SocialLoginTestPage from './pages/SocialLoginTestPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UsernamePage from './pages/UsernamePage';
import PasswordPage from './pages/PwPage';
import SignupCompletePage from './pages/SignupCompletePage';
import PwChangePage from './pages/PwChangePage';
import ManagerLoginPage from './pages/ManagerLoginPage';

//임시
import Certification from './pages/certification';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<IndexPage /> } />
        <Route path="/test" element={<TestPage />} />
        <Route path="/social" element={<SocialLoginTestPage />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/finding/password" element={<PasswordPage />} />
        <Route path="/finding/username" element={<UsernamePage />} />
        <Route path="/auth/signupcomplete" element={<SignupCompletePage />} />
        <Route path="/finding/pwchange" element={<PwChangePage />}/>
        <Route path="/auth/signupcomplete" element={<SignupCompletePage />} />
        <Route path="/auth/managerlogin" element={<ManagerLoginPage />}/>

        <Route path="/sms" element={<Certification />}/>

      </Routes>
    </div>
  );
}

export default App;
