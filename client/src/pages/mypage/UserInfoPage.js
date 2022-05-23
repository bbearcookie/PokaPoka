import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from '../../components/form/Button';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import {Link} from 'react-router-dom';
import * as api from '../../utils/api';
import useRequest from '../../utils/useRequest';
import { getFormattedDate } from '../../utils/common';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/modal/Modal';
import ModalHeader from '../../components/modal/ModalHeader';
import ModalBody from '../../components/modal/ModalBody';
import ModalFooter from '../../components/modal/ModalFooter';
import './UserInfoPage.scss';

const withdrawalState = {
  0: '일반 상태',
  1: '탈퇴 요청'
}

const UserInfoPage = () => {
    const request = useRequest();
    const navigate = useNavigate();
    const [users,setUsers]=useState({
        username: '',
        name: '',
        phone: '',
        nickname: '',
        favorite: '',
        withdrawal: ''
    });
    const state = {
      withdrawal: 1,
      normal: 0
    };
    const [showModal, setShowModal] = useState(false); // 모달 창 화면에 띄우기 on/off
    const [modalContent, setModalContent] = useState({ // 모달의 header, body에 보여줄 메시지
        header: '',
        body: ''
      });

    // 페이지 로드시 동작
    const onLoad = async () => {
    try {
      //회원 정보 가져오기
      let res = await request.call(api.getUserInfo);
      if(!res.user.favorite) res.user.favorite = '없음';
      setUsers({
        username: res.user.username,
        name: res.user.name,
        phone: res.user.phone,
        nickname: res.user.nickname,
        favorite: res.user.favorite,
        withdrawal: res.user.withdrawal
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
    // 탈퇴 요청 버튼 클릭시 작동
    const onClickWithdrawal = async () => {
        try {
          const res = await request.call(api.patchUser, state);
          setModalContent({
            header: '탈퇴 요청',
            body: res.message
          });
        } catch (err) {
          setModalContent({
            header: '탈퇴 요청',
            body: err.response.data.message
          });
        } finally {
          openModal();
        }
      }

      // 탈퇴 요청 취소 버튼 클릭시 작동
    const onClickCancel = async () => {
      try {
        const res = await request.call(api.patchUserCancel, state);
        setModalContent({
          header: '탈퇴 요청 취소',
          body: res.message
        });
      } catch (err) {
        setModalContent({
          header: '탈퇴 요청 취소',
          body: err.response.data.message
        });
      } finally {
        openModal();
      }
    }

    return(
        <UserTemplate className="UserInfoPage" sidebar={<MyPageSidebar/>}>
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

            {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
            {request.loading ? <LoadingSpinner /> : null}
            <h1 className="title-label">사용자 정보 관리</h1>
            <section className="InfoManage_sec">
                <form>
                    <Table>
                        <tr>
                            <th className="b">아이디</th>
                            <th className="a"><p>{users.username}</p></th>
                        </tr>
                        <tr>
                            <th className="b">이름</th>
                            <th className="a"><p>{users.name}</p></th>
                        </tr>
                        <tr>
                            <th className="b">전화번호</th>
                            <th className="a"><p>{users.phone}</p></th>
                        </tr>
                        <tr>
                            <th className="b">닉네임</th>
                            <th className="a"><p>{users.nickname}</p></th>
                        </tr>
                        <tr>
                            <th className="b"> 최애그룹</th>
                            <th className="a"><p>{users.favorite}</p></th>
                        </tr>
                        <tr>
                            <th className="b">탈퇴 요청 여부</th>
                            <th className="a"><p>{withdrawalState[users.withdrawal]}</p></th>
                        </tr>
                    </Table>
                    <section className='submit_section'>
                      {users.withdrawal ?
                      <Button className="withdrawal_button" onClick={onClickCancel}>탈퇴 요청 취소</Button> :
                      <Button className="withdrawal_button" onClick={onClickWithdrawal}>탈퇴 요청</Button>}
                      <Link to="/mypage/userInfo/edit"><Button className="edit_button" submit="submit" >수정</Button></Link>
                    </section>
                </form>
            </section>
        </UserTemplate>
    );
};

export default UserInfoPage;