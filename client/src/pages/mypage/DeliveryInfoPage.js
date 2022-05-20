import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import produce from 'immer';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import MessageLabel from '../../components/MessageLabel';
import Button from '../../components/form/Button';
import Input from '../../components/form/Input';
import Modal from '../../components/modal/Modal';
import ModalHeader from '../../components/modal/ModalHeader';
import ModalBody from '../../components/modal/ModalBody';
import ModalFooter from '../../components/modal/ModalFooter';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import DaumPostCode from 'react-daum-postcode';
import './DeliveryInfoPage.scss';

const DeliveryInfoPage = () => {
  const [form, setForm] = useState({
    address: ''
  });
  const [showSearchModal, setShowSearchModal] = useState(false); // 주소 검색 모달 창 화면에 띄우기 on/off
  const [showCompleteModal, setShowCompleteModal] = useState(false); // 수정 완료 메시지 띄울 모달 창
  const [message, setMessage] = useState('');
  const request = useRequest();
  const navigate = useNavigate();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      // 회원 정보 가져오기
      let res = await request.call(api.getAddress);
      console.log(res);
      setForm({
        address: res.user.address
      });
    }
    catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  // 주소 검색 모달 창 열기 / 닫기
  const openSearchModal = () => setShowSearchModal(true);
  const closeSearchModal = () => setShowSearchModal(false);

  // 수정 완료 모달 창 열기 / 닫기
  const openCompleteModal = () => setShowCompleteModal(true);
  const closeCompleteModal = () => setShowCompleteModal(false);

  // input 값 변경시
  const onChangeInput = (e) => {
    setForm(produce(draft => {
      draft[e.target.name] = e.target.value;
    }));
  }

  // 다음 주소 검색 api 사용
  const handleComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';
    if (data.addressType === 'R') {
        if (data.bname !== '') {
            extraAddress += data.bname;
        }
        if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
        }
        fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        setForm({
          address: fullAddress
        });
        closeSearchModal();
    }
    //fullAddress -> 전체 주소반환
  }


  // 뒤로가기 버튼 클릭시 작동
  const onClickBackButton = () => {
    return navigate(-1);
  }

  // 전송 버튼 클릭시 작동
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await request.call(api.putAddress, form);
      openCompleteModal();
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }

  return (
    <UserTemplate
      className="DeliveryInfoPage"
      sidebar={<MyPageSidebar/>}
    >

    {/* 주소 검색 모달 창 */}
    {showSearchModal ?
    <Modal onClose={closeSearchModal}>
      <ModalHeader onClose={closeSearchModal}>
        <h1>주소 검색</h1>
      </ModalHeader>
      <ModalBody>
        <DaumPostCode className="post-code" onComplete={handleComplete} />
      </ModalBody>
      <ModalFooter>
      </ModalFooter>
    </Modal> : null}

    {/* 수정 완료 모달 창 */}
    {showCompleteModal ?
    <Modal onClose={closeCompleteModal}>
      <ModalHeader onClose={closeCompleteModal}>
        <h1>배송 주소 수정</h1>
      </ModalHeader>
      <ModalBody>
        <p>배송 주소가 수정되었습니다.</p>
      </ModalBody>
      <ModalFooter>
        <Button className="submit_button" onClick={closeCompleteModal}>확인</Button>
      </ModalFooter>
    </Modal> : null}

    <form onSubmit={onSubmit}>
      <section className="form_section">
        <h1 className="title-label">배송 정보</h1>
        {message ? <MessageLabel>{message}</MessageLabel> : null}

        <div className="label_section">
          <span className="label">주소</span>
          <Input
            type="text"
            name="address"
            value={form.address}
            autoComplete="off"
            placeholder="주소를 입력해주세요"
            onChange={onChangeInput}
          />
          <Button className="cancel_button" type="button" onClick={openSearchModal}>주소 검색</Button>
        </div>

        <section className="submit_section">
          <Button className="cancel_button" type="button" onClick={onClickBackButton}>취소</Button>
          <Button className="submit_button" type="submit">수정</Button>
        </section>

      </section>
    </form>

    </UserTemplate>
  );
};

export default DeliveryInfoPage;