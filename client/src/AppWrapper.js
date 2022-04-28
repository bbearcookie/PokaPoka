import { AuthProvider } from './contexts/Auth';
import App from './App';

// App을 전역에서 공유하는 Context의 Provider로 감싸주기 위한 코드이다.
// index.js에서 여러 외부 모듈 설정과 섞이면 나중에 코드 유지보수가 어려워질 것 같아서
// App을 이렇게 감싸주었다.
function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}

export default AppWrapper;
