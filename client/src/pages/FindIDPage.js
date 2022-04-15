import React from 'react';
//import DBInsertForm from '../components/DBInsertTestForm';
//import DBGetTestForm from '../components/DBGetTestForm';
import FindIDForm from '../components/FindIDForm';
//import './TestPage.scss';

const FindIDPage = () => {
  return (
    <div className="FindIDPage">
      <h1 className="title-label">아이디 찾기</h1>
      <hr />
      <FindIDForm />
    </div>
  );
};

export default FindIDPage;