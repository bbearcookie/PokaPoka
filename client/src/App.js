import { Route, Routes } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import TestPage from './pages/TestPage';
import KakaoTestPage from './pages/KakaoTestPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<IndexPage /> } />
        <Route path="/test" element={<TestPage />} />
        <Route path="/kakao" element={<KakaoTestPage />} />
      </Routes>
    </div>
  );
}

export default App;
