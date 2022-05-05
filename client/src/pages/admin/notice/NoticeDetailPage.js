import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import Button from '../../../components/form/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import Modal from '../../../components/modal/Modal';
import ModalHeader from '../../../components/modal/ModalHeader';
import ModalBody from '../../../components/modal/ModalBody';
import ModalFooter from '../../../components/modal/ModalFooter';
import AdminTemplate from '../../../templates/AdminTemplate';
import './NoticeDetailPage.scss';

// 문의사항 상세 조회 페이지
const NoticeDetailPage = () => {
  const { noticeId } = useParams(); // URL에 포함된 suggestionId Params 정보
  const [notice, setNotice] = useState({ // 문의사항 상세 정보
    title: '',
    username: '',
    write_time: '',
    content: ''
  });
  const [showModal, setShowModal] = useState(false); // 삭제 모달 창 화면에 띄우기 on/off
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

  // 삭제 모달 열기 / 닫기
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // 삭제 버튼 클릭시
  const onClickRemove = async () => {
    try {
      const res = await request.call(api.deleteNotice, noticeId);
      return navigate('/admin/notice');
    } catch (err) {
      setMessage(err.response.data.message);
    }
    closeModal();
  }

  return (
    <AdminTemplate className="AdminGroupDetailPage">

      {/* 삭제 버튼 눌리면 삭제 모달 창 띄움 */}
      {showModal ?
      <Modal className="remove_modal" onClose={closeModal}>
        <ModalHeader onClose={closeModal}>
          <h1>공지사항 삭제</h1>
        </ModalHeader>
        <ModalBody>
          <p>정말로 {notice.title}을(를) 삭제하시겠습니까?</p>
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeModal}>취소</Button>
          <Button className="remove_button" onClick={onClickRemove}>삭제</Button>
        </ModalFooter>
      </Modal> : null}

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
        <p>{notice.write_time}</p>
      </section>
      <section className="label_area">
        <p className="label">내용</p>
        <p>{notice.content}</p>
      </section>
      <section className="submit_section">
        <Link to="/admin/notice"><Button className="cancel_button">뒤로 가기</Button></Link>
        <Link to={`/admin/notice/writer/${noticeId}`}><Button className="edit_button">수정</Button></Link>
        <Button className="remove_button" onClick={openModal}>삭제</Button>
      </section>
    </AdminTemplate>
  );
};

export default NoticeDetailPage;