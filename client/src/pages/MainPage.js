import React from 'react';
import UserTemplate from '../templates/UserTemplate';
import PhotoStoarageSidebar from '../components/sidebar/PhotoStoarageSidebar';
import './MainPage.scss';

const MainPage = () => {
  return (
    <UserTemplate
      className="MainPage"
    >
      <p>사용자 메인 페이지</p>
    </UserTemplate>
  );
};

export default MainPage;