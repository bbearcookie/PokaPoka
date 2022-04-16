import { Link } from 'react-router-dom';
import React from 'react';
import './IndexPage.scss';

const IndexPage = () => {
  return (
    <div className="IndexPage">
      <h1 className="title-label">어서오십시오!!! 클라이언트 화면입니다</h1>
      <div>
        <Link to="/test">테스트 페이지로 가기</Link>
        <br />
        <Link to="/kakao">카카오 테스트 페이지로 가기</Link>
      </div>
    </div>
  );
};

export default IndexPage;