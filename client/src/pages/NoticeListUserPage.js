import React, { useState, useEffect} from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';
import UserTemplate from '../templates/UserTemplate';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/form/Button';
import NoticeList from '../components/list/NoticeList';
import './NoticeListUserPage.scss'


// 공지사항 목록 조회 페이지
const NoticeListUserPage = () => {
  const request = useRequest();
  const [notice, setNotice] = useState([]);
  const navigate = useNavigate();
 


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
    
 
      <UserTemplate className="NoticeListUserPage">
        {request.loading ? <LoadingSpinner /> : null}
        <section className="title_area">
          <h1 className="title-label">공지사항 목록</h1>
          
        </section>

        <NoticeList notices={notice} perPage="10" />

      </UserTemplate>

  );
  
};

export default NoticeListUserPage;