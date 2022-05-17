import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/form/Button';
import './UsernamePage.scss';
import useRequest from '../utils/useRequest';
import Modal from '../components/modal/Modal';
import ModalHeader from '../components/modal/ModalHeader';
import ModalBody from '../components/modal/ModalBody';
import ModalFooter from '../components/modal/ModalFooter';
import LoadingSpinner from '../components/LoadingSpinner';
import * as api from '../utils/api';

const UsernamePage = () =>{
  const [form, setForm] = useState({
    name: '',
    phone: ''
  });
  const [id, setId] = useState({});
  const [message, setMessage] = useState('');
  const request = useRequest();
  const navigate = useNavigate();
      
    //모달 창 열기 / 닫기
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  const [showModal, setShowModal] = useState(false); // 모달 창 화면에 띄우기 on/off

  // input 값 변경시 상태 변수값 업데이트
  const onChangeInput = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  //찾기 버튼 클릭시
  const onFindButton = async () => {
    try {
      const res = await request.call(api.getUsername, form.name, form.phone);
      setMessage(res.message);
      setId(res.username);
      if(res.username) openModal();
    } catch (err) {
      console.error(err);
      setMessage(err.response.data.message);
    }
  }

  //모달 창 확인 버튼 클릭 시
  const gotoLogin = async () => {
    try {
      navigate(-1);
    } catch (err) {
      console.error(err);
      setMessage(err.response.data.message);
    }
  }

  // 뒤로가기 버튼 클릭시
  const onClickBackButton = () => {
    return navigate(-1);
  }
  
  return(
  <div className="UsernamePage">
    <header>
      <h1>PokaPoka</h1>
    </header>

    {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
    {request.loading ? <LoadingSpinner /> : null}

    {/* 모달 창 */}
    {showModal ?
    <Modal onClose={closeModal}>
      <ModalHeader onClose={closeModal}>
        <h1>아이디 찾기</h1>
      </ModalHeader>
      <ModalBody>
        <p>아이디는 {id.username} 입니다.</p>
      </ModalBody>
      <ModalFooter>
        <Button className="submit_button" onClick={gotoLogin}>확인</Button>
      </ModalFooter>
    </Modal> : null}

    <section className="username_section">
    <form>
        <p className="title-label">아이디찾기</p>
      
        {message ? <p className="message-label">{message}</p> : null}
        <input
          type="text"
          name="name"
          placeholder="이름"
          autoComplete="off"
          value={form.name} 
          onChange={onChangeInput}
      
        />
        <input
          type="text"
          name="phone"
          placeholder="전화번호"
          autoComplete="off"
          value={form.phone} 
          onChange={onChangeInput}
        
        />
        <Button className="find_btn" onClick={onFindButton}>찾기</Button>
        <Button className="cancel_button" onClick={onClickBackButton}>뒤로가기</Button>
        </form>
        </section>

  </div>
  );
}
export default UsernamePage;