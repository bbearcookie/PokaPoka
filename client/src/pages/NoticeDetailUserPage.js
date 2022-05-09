import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';
import Button from '../components/form/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import MessageLabel from '../components/MessageLabel';
import UserTemplate from '../templates/UserTemplate';
import PhotoStoarageSidebar from '../components/sidebar/PhotoStoarageSidebar';
import { getFormattedDate } from '../utils/common';
import './NoticeDetailUserPage.scss';

// 문의사항 상세 조회 페이지
const NoticeDetailUserPage = () => {
  const { noticeId } = useParams(); // URL에 포함된 suggestionId Params 정보
  const [notice, setNotice] = useState({ // 문의사항 상세 정보
    title: '',
    username: '',
    write_time: '',
    content: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const request = useRequest();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {

      // 문의사항 정보 가져오기
      let res = await request.call(api.getNoticeDetail, noticeId);
      console.log(res);
      setNotice({
        title: res.notice.title,
        username: res.notice.username,
        write_time: res.notice.write_time,
        content: res.notice.content
      });
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <UserTemplate
      className="NoticeDetailUserPage"
      sidebar={<PhotoStoarageSidebar />}
    >

      {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
      {request.loading ? <LoadingSpinner /> : null}

      <h1 className="title-label">공지사항 상세 정보</h1>
      {message ? <MessageLabel>{message}</MessageLabel> : null}
      <section className="label_area">
        <p className="label">제목</p>
        <p>{notice.title}</p>
      </section>
      <section className="label_area">
        <p className="label">작성자</p>
        <p>{notice.username}</p>
      </section>
      <section className="label_area">
        <p className="label">작성일</p>
        <p>{getFormattedDate(notice.write_time)}</p>
      </section>
      <section className="label_area">
        <p className="label">내용</p>
        <p>{notice.content}</p>
      </section>
      <section className="submit_section">
        <Link to="/main"><Button className="cancel_button">뒤로 가기</Button></Link>
      </section>
    </UserTemplate>
  );
};

export default NoticeDetailUserPage;