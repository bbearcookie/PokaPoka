import { Route, Routes } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import TestPage from './pages/TestPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<IndexPage /> } />
        <Route path="/test" element={<TestPage />} />
      </Routes>
    </div>
  );
}

export default App;
