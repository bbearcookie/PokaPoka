import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './IndexPage.scss';

const IndexPage = () => {
  const navigate = useNavigate();

  const onLoad = () => {
    return navigate('/auth/login'); // 로그인 페이지로 이동하도록 임시로 해둠.
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <div className="IndexPage">
      <h1 className="title-label">어서오십시오!!! 클라이언트 화면입니다</h1>
      <div>
        <Link to="/test">테스트 페이지로 가기</Link>
        <br />
        <Link to="/auth/login">로그인 페이지로 가기</Link>
      </div>
    </div>
  );
};

export default IndexPage;