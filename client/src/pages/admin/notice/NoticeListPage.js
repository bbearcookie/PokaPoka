import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import AdminTemplate from '../../../templates/AdminTemplate';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/form/Button';
import './NoticeListPage.scss';
import NoticeList from '../../../components/list/NoticeList';

// 공지사항 목록 조회 페이지
const NoticeListPage = () => {
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
    <AdminTemplate className="NoticeListPage">
      {request.loading ? <LoadingSpinner /> : null}
      <section className="title_area">
        <h1 className="title-label">공지사항 목록</h1>
        <Link to="/admin/notice/writer">
          <Button className="add_button">작성</Button>
        </Link>
      </section>

      <NoticeList notices={notice} perPage="10" />

    </AdminTemplate>
  );
};

export default NoticeListPage;