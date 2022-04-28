import React, { useState } from 'react';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';

const SocialLoginTestPage = () => {
  const [message, setMessage] = useState('');
  const request = useRequest();

  // 카카오 로그인 요청 URL
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?` + 
  `client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&` +
  `redirect_uri=${process.env.REACT_APP_KAKAO_LOGIN_REDIRECT_URI}&` +
  `response_type=code`;

  // 네이버 로그인 요청 URL
  const naverURL = `https://nid.naver.com/oauth2.0/authorize?` +
  `client_id=${process.env.REACT_APP_NAVER_LOGIN_CLIENT_ID}&` +
  `redirect_uri=${process.env.REACT_APP_NAVER_LOGIN_REDIRECT_URI}&` +
  `state=STATE_STRING&` +
  `response_type=code`;

  // 로그인 검증 테스트
  const onClickLoginTest = async () => {
    try {
      const res = await request.call(api.postTokenTest);
      setMessage(res.message);
    } catch (err) {
      console.error(err);
      setMessage(err.response.data.message);
    }
  }

  // 로그아웃 테스트
  const onClickLogoutTest = async () => {
    const res = await request.call(api.postLogout);
    console.log(res);
  }
  
  return (
    <div className="SocialLoginTestPage">
      <a href={kakaoURL}>카카오 로그인</a>
      <br />
      <a href={naverURL}>네이버 로그인</a>
      <br />
      <button type="button" onClick={onClickLoginTest}>로그인 토큰 테스트</button>
      <button type="button" onClick={onClickLogoutTest}>로그아웃</button>
      <p>{message}</p>
    </div>
  );
};

export default SocialLoginTestPage;