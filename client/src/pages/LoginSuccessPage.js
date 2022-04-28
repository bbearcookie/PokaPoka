import React, { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';
import AuthContext from '../contexts/Auth';

// 소셜 로그인 성공시 리디렉션 되는 화면이다.
// 여기서 사용자의 정보를 전역적으로 공유해서 사용할 수 있게 AuthContext의 상태 값에 저장하고
// 다른 페이지로 리디렉션 한다.
const LoginSuccessPage = () => {
  const { state: authState, actions: authActions } = useContext(AuthContext);
  const navigate = useNavigate();
  const request = useRequest();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.postTokenTest);
      authActions.login(res);
      return navigate('/auth/login'); // 로그인 성공시 리디렉션할 페이지
    } catch (err) {
      console.error(err);
      return navigate('/auth/login');
    }
  }
  useEffect(() => { onLoad(); }, []);

  return (
    <div className="LoginSuccessPage">
      LoginSuccessPage
    </div>
  );
};

export default LoginSuccessPage;