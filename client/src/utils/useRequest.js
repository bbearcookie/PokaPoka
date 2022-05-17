import { useState, useContext } from 'react';
import AuthContext from '../contexts/Auth';

// API 요청 함수 requestThunk를 실행하고, 로딩이나 에러에 대한 발생 결과를 state에 저장함.
function useRequest() {
  const { state: authState, actions: authActions } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  async function call(requestThunk, ...params) {
    setLoading(true);
    
    try {
      const result = await requestThunk(...params);
      setLoading(false);
      return result.data;
    } catch (err) {
      setError(true);
      setLoading(false);
      if (err.response.status === 401) authActions.logout(); // 로그인 상태가 아니면 클라이언트 로그아웃 처리
      throw err;
    }
    
  };
  return { call, loading, error };
}

export default useRequest;