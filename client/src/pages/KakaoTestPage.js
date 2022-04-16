import React from 'react';

const KakaoTestPage = () => {

  // 카카오 로그인 요청 URL
  const authorizeURL = `https://kauth.kakao.com/oauth/authorize?` + 
  `client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&` +
  `redirect_uri=${process.env.REACT_APP_KAKAO_LOGIN_REDIRECT_URI}&` +
  `response_type=code`;

  return (
    <div className="KakaoTestPage">
      <a href={authorizeURL}>카카오 로그인</a>
      <br />
    </div>
  );
};

export default KakaoTestPage;