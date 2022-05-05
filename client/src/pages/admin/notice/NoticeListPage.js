import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import AdminTemplate from '../../../templates/AdminTemplate';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/form/Button';
import ImageCard from '../../../components/card/ImageCard';
import './NoticeListPage.scss';

// 공지사항 목록 조회 페이지
const NoticeListPage = () => {
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
    <AdminTemplate className="AdminGroupListPage">
      {request.loading ? <LoadingSpinner /> : null}
      <section className="title_area">
        <h1 className="title-label">공지사항 목록</h1>
        <Link to="/admin/notice/writer">
          <Button className="add_button">작성</Button>
        </Link>
      </section>
      <section className="card_section">
        {notice ?
        notice.map(notice =>
          <Link to={`/admin/notice/detail/${notice.notice_id}`}>
            <ImageCard
              key={notice.notice_id}
              name={notice.title}
            />
          </Link>
        ) : null}
      </section>
    </AdminTemplate>
  );
};

export default NoticeListPage;