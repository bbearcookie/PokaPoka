import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/form/Button';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import * as api from '../../utils/api';
import produce from 'immer';
import useRequest from '../../utils/useRequest';
import LoadingSpinner from '../../components/LoadingSpinner';
import MessageLabel from '../../components/MessageLabel';
import Modal from '../../components/modal/Modal';
import ModalHeader from '../../components/modal/ModalHeader';
import ModalBody from '../../components/modal/ModalBody';
import ModalFooter from '../../components/modal/ModalFooter';
import Input from '../../components/form/Input';
import DaumPostCode from 'react-daum-postcode';
import './DeliveryInfoWritePage.scss';

//회원정보 수정 페이지
const DeliveryInfoWritePage = () => {
    const [form, setForm] = useState({
        address: '',
        address_detail: ''
      });
      const [showModal, setShowModal] = useState(false); // 모달 창 화면에 띄우기 on/off
      const [modalContent, setModalContent] = useState({ // 모달의 header, body에 보여줄 메시지
        header: '',
        body: ''
      });
      const [message, setMessage] = useState("");
      const request = useRequest();
      const navigate = useNavigate();
    
      // 페이지 로드시 동작
      // const onLoad = async () => {
      //   try {
      //     const res = await request.call(api.getGroupList);
      //     setGroups(res.groups);
      //   } catch (err) {
      //     setMessage(err.response.data.message);
      //   }
      // }
      // useEffect(() => { onLoad(); }, []);
  
      //모달 창 열기 / 닫기
      const openModal = () => setShowModal(true);
      const closeModal = () => setShowModal(false);

      // 뒤로가기 버튼 클릭시 작동
      const onClickBackButton = () => {
        return navigate(-1);
      }
    
      // 전송 버튼 클릭시 작동
      const onSubmit = async (e) => {
        e.preventDefault();
        try {
          const res = await request.call(api.putAddress, form);
          setMessage(res.message);
          setTimeout(() => {  return navigate('/mypage/deliveryinfo'); }, 1000);
        } catch (err) {
          setMessage(err.response.data.message);
        }
      }

      //다음 주소 검색 api 사용
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
            closeModal();
        }
        //fullAddress -> 전체 주소반환
    }

    // 상세 주소 값 변경시
    const onChangeInput = (e) => {
      setForm(produce(draft => {
        draft[e.target.name] = e.target.value;
      }));
    }

    return(
        <UserTemplate className="DeliveryInfoWritePage" sidebar={<MyPageSidebar/>}>
          {request.loading ? <LoadingSpinner /> : null}

          {/* 모달 창 */}
          {showModal ?
          <Modal onClose={closeModal}>
            <ModalHeader onClose={closeModal}>
              <h1>주소 검색</h1>
            </ModalHeader>
            <ModalBody>
              <DaumPostCode onComplete={handleComplete} className="post-code" />
            </ModalBody>
            <ModalFooter>
            </ModalFooter>
          </Modal> : null}

          <form onSubmit={onSubmit}>
            <section className="form_section">
              <h1 className="title-label">배송 정보</h1>
              {message ? <MessageLabel>{message}</MessageLabel> : null}

              <section className="input_section">
                <div className="label_section">
                  <span className="label">주소</span>
                  <Input
                    type="text"
                    name="address"
                    value={form.address}
                    maxLength="30"
                    autoComplete="off"
                    placeholder="주소를 입력해주세요"
                    onChange={onChangeInput}
                  />
                  <Button className="cancel_button" type="button" onClick={openModal}>주소 검색</Button>
                </div>
                <div className="label_section">
                  <span className="label">상세 주소</span>
                  <Input
                    type="text"
                    name="address_detail"
                    value={form.address_detail}
                    maxLength="30"
                    autoComplete="off"
                    placeholder="상세 주소를 입력해주세요"
                    onChange={onChangeInput}
                  />
                </div>
              </section>
            </section>

            <section className="submit_section">
              <Button className="cancel_button" type="button" onClick={onClickBackButton}>뒤로가기</Button>
              <Button className="submit_button" type="submit">추가</Button>
            </section>

          </form>
        </UserTemplate>
    );
};

export default DeliveryInfoWritePage;