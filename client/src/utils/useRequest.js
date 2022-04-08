import { useState } from 'react';

// API 요청 함수 requestThunk를 실행하고, 로딩이나 에러에 대한 발생 결과를 state에 저장함.
function useRequest() {
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
      throw err;
    }
    
  };
  return { call, loading, error };
}

export default useRequest;