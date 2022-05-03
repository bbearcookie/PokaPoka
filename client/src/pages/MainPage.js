import React from 'react';
import UserTemplate from '../templates/UserTemplate';
import PhotoStoarageSidebar from '../components/sidebar/PhotoStoarageSidebar';
import './MainPage.scss';

const MainPage = () => {
  return (
    <UserTemplate
      className="MainPage"
      sidebar={<PhotoStoarageSidebar />}
    >
      <p>메잉ㄴ페이지</p>
      <p>메잉ㄴ페이지</p>
      <p>메잉ㄴ페이지</p>
    </UserTemplate>
  );
};

export default MainPage;