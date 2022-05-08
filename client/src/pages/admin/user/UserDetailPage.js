import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { getFormattedDate } from '../../../utils/common';
import Button from '../../../components/form/Button';
import Textarea from '../../../components/form/Textarea';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import Badge from '../../../components/Badge';
import Modal from '../../../components/modal/Modal';
import ModalHeader from '../../../components/modal/ModalHeader';
import ModalBody from '../../../components/modal/ModalBody';
import ModalFooter from '../../../components/modal/ModalFooter';
import AdminTemplate from '../../../templates/AdminTemplate';
import produce from 'immer';
import Table from 'react-bootstrap/Table';
import './UserDetailPage.scss';

const withdrawalState = {
  0: '일반 상태',
  1: '탈퇴 요청'
}

const inactiveState = {
  0: '일반 상태',
  1: '비활성화'
}

// 회원 정보 상세 조회 페이지
const UserDetailPage = () => {
  const { username } = useParams(); // URL에 포함된 suggestionId Params 정보
  const [showModal, setShowModal] = useState(false); // 삭제 모달 창 화면에 띄우기 on/off
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const request = useRequest();
  const [users,setUsers]=useState({
      username: '',
      name: '',
      phone: '',
      nickname: '',
      favorite: ''
  });
  const state = {
    inactive: 1,
    normal: 0
  };
  const [modalContent, setModalContent] = useState({ // 모달의 header, body에 보여줄 메시지
    header: '',
    body: ''
  });

  // 페이지 로드시 동작
  const onLoad = async () => {
  try {
    //회원 정보 가져오기
    let res = await request.call(api.getUserDetail, username);
    console.log(res);
    if(!res.user.favorite) res.user.favorite = '없음';
    if(!res.user.address) res.user.address = '없음';
    setUsers({
      username: res.user.username,
      name: res.user.name,
      phone: res.user.phone,
      nickname: res.user.nickname,
      favorite: res.user.favorite,
      address: res.user.address,
      withdrawal: res.user.withdrawal,
      inactive: res.user.inactive,
      regist_time: res.user.regist_time
    });
  } catch (err) {
    console.error(err);
  }};
  useEffect(() => { onLoad(); }, []);

  // 모달 열기 / 닫기
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    navigate(0);
  }

  // 탈퇴 버튼 클릭시 작동
  const onClickWithdrawal = async () => {
    try {
      const res = await request.call(api.deleteUser, username);
      setModalContent({
        header: '회원 탈퇴',
        body: res.message
      });
    } catch (err) {
      setModalContent({
        header: '회원 탈퇴',
        body: err.response.data.message
      });
    } finally {
      openModal();
    }
  }

  // 비활성화 버튼 클릭시 작동
  const onClickInactive = async () => {
    try {
      const res = await request.call(api.patchInactive, state, username);
      setModalContent({
        header: '비활성화',
        body: res.message
      });
    } catch (err) {
      setModalContent({
        header: '비활성화',
        body: err.response.data.message
      });
    } finally {
      openModal();
    }
  }
  
  // 비활성화 버튼 클릭시 작동
  const onClickCancel = async () => {
    try {
      const res = await request.call(api.patchInactiveCancel, state, username);
      setModalContent({
        header: '비활성화 취소',
        body: res.message
      });
    } catch (err) {
      setModalContent({
        header: '비활성화 취소',
        body: err.response.data.message
      });
    } finally {
      openModal();
    }
  }

  const back = () => navigate(-1);

  return (
    <AdminTemplate className="UserDetailPage">

      {/* 모달 창 띄움 */}
      {showModal ?
      <Modal onClose={closeModal}>
          <ModalHeader onClose={closeModal}>
          <h1>{modalContent.header}</h1>
          </ModalHeader>
          <ModalBody>
          <p>{modalContent.body}</p>
          </ModalBody>
          <ModalFooter>
          <Button className="submit_button" onClick={closeModal}>확인</Button>
          </ModalFooter>
      </Modal> : null}

      {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
      {request.loading ? <LoadingSpinner /> : null}
      {message ? <MessageLabel>{message}</MessageLabel> : null}

      <h1 className="title-label">회원정보</h1>
      <section className="InfoManage_sec">
        <form>
          <Table>
            <tr><th className="b">아이디</th><th><p>{users.username}</p></th></tr>
            <tr><th className="b">이름</th><th><p>{users.name}</p></th></tr>
            <tr><th className="b">전화번호</th><th><p>{users.phone}</p></th></tr>
            <tr><th className="b">닉네임</th><th><p>{users.nickname}</p></th></tr>
            <tr><th className="b">최애그룹</th><th><p>{users.favorite}</p></th></tr>
            <tr><th className="b">주소</th><th><p>{users.address}</p></th></tr>
            <tr><th className="b">탈퇴 요청 여부</th><th><p>{withdrawalState[users.withdrawal]}</p></th></tr>
            <tr><th className="b">비활성화 여부</th><th><p>{inactiveState[users.inactive]}</p></th></tr>
            <tr><th className="b">등록일</th><th><p>{getFormattedDate(users.regist_time)}</p></th></tr>
          </Table>
        </form>
      </section>
      <section className="submit_section">
        <Button className="cancel_button" onClick={back}>뒤로 가기</Button>
        <Button className="withdrawal_button" onClick={onClickWithdrawal}>탈퇴</Button>
        {users.inactive ? 
        <Button className="inactive_button" onClick={onClickCancel}>비활성화 취소</Button>:
        <Button className="inactive_button" onClick={onClickInactive}>비활성화</Button>}
      </section>
    </AdminTemplate>
  );
};

export default UserDetailPage;