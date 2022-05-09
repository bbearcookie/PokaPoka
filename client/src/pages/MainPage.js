import React, { useState, useEffect } from 'react';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';
import UserTemplate from '../templates/UserTemplate';
import PhotoStoarageSidebar from '../components/sidebar/PhotoStoarageSidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import NoticeList from '../components/list/NoticeList';
import './MainPage.scss';

const MainPage = () => {
  const request = useRequest();
  const [notice, setNotice] = useState([]);

  // 화면 로드시 작동
  const onLoad = async (e) => {
    try {
      const res = await request.call(api.getNoticeList);
      setNotice(res.notice);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <UserTemplate
      className="MainPage"
    >
      <p>사용자 메인 페이지</p>
      {request.loading ? <LoadingSpinner /> : null}
      <section className="title_area">
        <h1 className="title-label">공지사항 목록</h1>
      </section>

      <NoticeList notices={notice} perPage="5" />
    </UserTemplate>
  );
};

export default MainPage;