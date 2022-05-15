import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/form/Button';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import * as api from '../../utils/api';
import produce from 'immer';
import useRequest from '../../utils/useRequest';
import Select from '../../components/form/Select';
import LoadingSpinner from '../../components/LoadingSpinner';
import MessageLabel from '../../components/MessageLabel';
import Modal from '../../components/modal/Modal';
import ModalHeader from '../../components/modal/ModalHeader';
import ModalBody from '../../components/modal/ModalBody';
import ModalFooter from '../../components/modal/ModalFooter';
import Input from '../../components/form/Input';
import './EditUserPage.scss';

//회원정보 수정 페이지
const EditUserPage = () => {
    const [form, setForm] = useState({
        name: '',
        nickname: '',
        phone: '',
        cert_num: '',
        favorite: ''
      });
      const [groups, setGroups] = useState([]);
      const [showModal, setShowModal] = useState(false); // 모달 창 화면에 띄우기 on/off
      const [modalContent, setModalContent] = useState({ // 모달의 header, body에 보여줄 메시지
        header: '',
        body: ''
      });
      const [message, setMessage] = useState("");
      const request = useRequest();
      const navigate = useNavigate();
    
      // 페이지 로드시 동작
      const onLoad = async () => {
        try {
          let res = await request.call(api.getUserInfo);
        setForm(produce(draft => {
          draft.name = res.user.name;
          draft.nickname = res.user.nickname;
          draft.phone = res.user.phone;
          draft.favorite = res.user.favorite;
        }));
          res = await request.call(api.getGroupList);
          setGroups(res.groups);
        } catch (err) {
          setMessage(err.response.data.message);
        }
      }
      useEffect(() => { onLoad(); }, []);
    
      // input 값 변경시
      const onChangeInput = (e) => {
        setForm(produce(draft => {
          draft[e.target.name] = e.target.value;
        }));
      }
  
      //모달 창 열기 / 닫기
      const openModal = () => setShowModal(true);
      const closeModal = () => setShowModal(false);

      // checkbox input 값 변경시
      const onChangeCheckboxInput = (e) => {
        setForm(produce(draft => {
          draft[e.target.name] = e.target.checked;
        }));
      }
     
      // input에 입력된 값이 숫자인 경우에만 상태 업데이트
      const onChangeNumberInput = (e) => {
        if (!/[^0-9]/.test(e.target.value)) {
          setForm(produce(draft => {
            draft[e.target.name] = e.target.value;
          }));
        }
      }
    
      // 인증번호 발송 버튼 클릭시 작동
      const onClickSendingButton = async () => {
        try {
          const res = await request.call(api.postSending, form.phone);
          setModalContent({
            header: '인증번호 발송',
            body: res.message
          });
        } catch (err) {
          setModalContent({
            header: '인증번호 발송',
            body: err.response.data.message
          });
        } finally {
          openModal();
        }
      }
    
      // 인증번호 확인 버튼 클릭시 작동
      const onClickCertifyButton = async () => {
        try {
          const res = await request.call(api.postConfirmation, form.cert_num);
          setModalContent({
            header: '인증번호 확인',
            body: res.message
          });
        } catch (err) {
          setModalContent({
            header: '인증번호 확인',
            body: err.response.data.message
          });
        } finally {
          openModal();
        }
      }
    
      // 뒤로가기 버튼 클릭시 작동
      const onClickBackButton = () => {
        return navigate(-1);
      }
    
      // 전송 버튼 클릭시 작동
      const onSubmit = async (e) => {
        e.preventDefault();
        try {
          const res = await request.call(api.putUserInfo, form);
          console.log(res);
          setMessage(res.message);
          return navigate(-1);
        } catch (err) {
          setMessage(err.response.data.message);
        }
      }

    return(
        <UserTemplate className="EditUserPage" sidebar={<MyPageSidebar/>}>
          {request.loading ? <LoadingSpinner /> : null}

          {/* 모달 창 */}
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

          <form onSubmit={onSubmit}>
            <section className="form_section">
              <h1 className="title-label">회원 정보 수정</h1>
              {message ? <MessageLabel>{message}</MessageLabel> : null}

              <section className="input_section">
                <div className="label_section">
                  <span className="label">이름</span>
                  <Input
                    type="text"
                    name="name"
                    value={form.name}
                    autoComplete="off"
                    placeholder="이름을 입력하세요"
                    onChange={onChangeInput}
                  />
                </div>
                <div className="label_section">
                  <span className="label">닉네임</span>
                  <Input
                    type="text"
                    name="nickname"
                    value={form.nickname}
                    autoComplete="off"
                    placeholder="닉네임을 입력하세요"
                    onChange={onChangeInput}
                  />
                </div>
                <div className="label_section">
                  <span className="label">휴대폰 번호</span>
                  <Input
                    type="text"
                    name="phone"
                    value={form.phone}
                    maxLength="11"
                    autoComplete="off"
                    placeholder="휴대폰 번호를 입력하세요 (숫자)"
                    onChange={onChangeNumberInput}
                  />
                  <Button className="cancel_button" type="button" onClick={onClickSendingButton}>인증번호 발송</Button>
                </div>
                <div className="label_section">
                  <span className="label">인증번호</span>
                  <Input
                    type="text"
                    name="cert_num"
                    value={form.cert_num}
                    maxLength="6"
                    autoComplete="off"
                    placeholder="인증번호를 입력하세요 (숫자)"
                    onChange={onChangeNumberInput}
                  />
                  <Button className="submit_button" type="button" onClick={onClickCertifyButton}>확인</Button>
                </div>
                <div className="label_section">
                  <span className="label">최애그룹</span>
                  <Select name="favorite" value={form.favorite} onChange={onChangeInput}>
                    <option value="">없음</option>
                    {groups ?
                    groups.map(group => 
                      <option key={group.name} value={group.name}>{group.name}</option>
                    ) : null} 
                  </Select>
                </div>
              </section>
            </section>

            <section className="submit_section">
              <Button className="cancel_button" type="button" onClick={onClickBackButton}>뒤로가기</Button>
              <Button className="submit_button" type="submit">수정</Button>
            </section>

          </form>
        </UserTemplate>
    );
};

export default EditUserPage;