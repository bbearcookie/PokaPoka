import React from 'react';
import DBInsertForm from '../components/DBInsertTestForm';
import DBGetTestForm from '../components/DBGetTestForm';
import './TestPage.scss';

const TestPage = () => {
  return (
    <div className="TestPage">
      <h1 className="title-label">테스트 페이지입니다.</h1>
      <h3>백엔드 서버로 텍스트 추가 요청</h3>
      <DBInsertForm />
      <hr />
      <h3>백엔드 서버의 DB에 저장된 텍스트들 조회</h3>
      <DBGetTestForm />
    </div>
  );
};

export default TestPage;