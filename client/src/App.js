import { Route, Routes } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import TestPage from './pages/TestPage';
import FindIDPage from './pages/FindIDPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<IndexPage /> } />
        <Route path="/test" element={<TestPage />} />
        <Route path="/findID" element={<FindIDPage />} />
      </Routes>
    </div>
  );
}

export default App;
