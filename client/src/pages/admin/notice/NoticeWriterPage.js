import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import produce from 'immer';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { BACKEND } from '../../../utils/api';
import AdminTemplate from '../../../templates/AdminTemplate';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import Input from '../../../components/form/Input';
import Textarea from '../../../components/form/Textarea';
import Button from '../../../components/form/Button';
import './NoticeWriterPage.scss';

// 공지사항 내용 작성 페이지. 공지사항 작성과 수정 작업이 가능하다.
const NoticeWriterPage = () => {
  const { noticeId } = useParams(); // URL에 포함된 noticeId Params 정보
  const [form, setForm] = useState({
    title: '',
    content: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const request = useRequest();

  // 화면 로드시
  const onLoad = async (e) => {
    // 기존의 공지사항 내용을 수정하려는 경우 기본 폼의 내용을 서버로부터 가져옴
    if (noticeId) {
      try {
        const res = await request.call(api.getNoticeDetail, noticeId);
        setForm(produce(draft => {
          draft.title = res.notice.title;
          draft.content = res.notice.content;
        }));
      } catch (err) {
        console.error(err);
      }
    }
  };
  useEffect(() => { onLoad(); }, []);

  // input 값 변경시
  const onChangeInput = (e) => {
    setForm(produce(draft => {
      draft[e.target.name] = e.target.value;
    }));
  }

  // 작성 취소 버튼 클릭시
  const onCancel = () => navigate(-1); // 뒤로 돌아가기

  // 작성 버튼 클릭시
  const onSubmit = async (e) => {
    e.preventDefault();

    // 새로 작성하는 경우
    if (!noticeId) {
      try {
        const res = await request.call(api.postNotice, form);
        setMessage(res.message);
        return navigate('/admin/notice');
      } catch (err) {
        setMessage(err.response.data.message);
      }
    // 내용을 수정하는 경우
    } else {
      try {
        const res = await request.call(api.putNotice, form, noticeId);
        setMessage(res.message);
        return navigate(`/admin/notice/detail/${noticeId}`);
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
  }

  return (
    <AdminTemplate className="AdminGroupWriterPage">
      {request.loading ? <LoadingSpinner /> : null}
      <form onSubmit={onSubmit}>
        {noticeId ?
        <h1 className="title-label">공지사항 수정</h1> :
        <h1 className="title-label">공지사항 작성</h1>}
        
        {message ? <MessageLabel>{message}</MessageLabel> : null}
        <p className="label">제목</p>
        <Input
          type="text"
          name="title"
          value={form.title}
          autoComplete="off"
          placeholder="제목을 입력하세요"
          onChange={onChangeInput}
        />
        <p className="label">내용</p>
        <Textarea
          name="content"
          value={form.content}
          placeholder="내용을 입력하세요"
          onChange={onChangeInput}
        />
        <section className="submit_section">
          <Button className="cancel_button" type="button" onClick={onCancel}>취소</Button>
          <Button className="submit_button" type="submit">작성</Button>
        </section>
      </form>
    </AdminTemplate>
  );
};

export default NoticeWriterPage;