import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import qs from 'qs';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { BACKEND } from '../../../utils/api';
import Button from '../../../components/form/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import Modal from '../../../components/modal/Modal';
import ModalHeader from '../../../components/modal/ModalHeader';
import ModalBody from '../../../components/modal/ModalBody';
import ModalFooter from '../../../components/modal/ModalFooter';
import AdminTemplate from '../../../templates/AdminTemplate';
import './MemberDetailPage.scss';

const MemberDetailPage = () => {
  const { memberId } = useParams(); // URL에 포함된 memberId Params 정보
  const { groupId } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  const [member, setMember] = useState({ // 멤버 상세 정보
    name: '',
    image_name: ''
  });
  const [showModal, setShowModal] = useState(false); // 삭제 모달 창 화면에 띄우기 on/off
  const [message, setMessage] = useState('');
  const request = useRequest();
  const navigate = useNavigate();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      // 멤버 정보 가져오기
      const res = await request.call(api.getMemberDetail, memberId);
      setMember({
        name: res.member.name,
        image_name: res.member.image_name
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
      const res = await request.call(api.deleteMember, memberId);
      return navigate(`/admin/group/detail/${groupId}`);
    } catch (err) {
      setMessage(err.response.data.message);
    }
    closeModal();
  }

  return (
    <AdminTemplate className="AdminMemberDetailPage">

      {/* 삭제 버튼 눌리면 삭제 모달 창 띄움 */}
      {showModal ?
      <Modal className="remove_modal" onClose={closeModal}>
        <ModalHeader onClose={closeModal}>
          <h1>멤버 삭제</h1>
        </ModalHeader>
        <ModalBody>
          <p>정말로 {member.name}을(를) 삭제하시겠습니까?</p>
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeModal}>취소</Button>
          <Button className="remove_button" onClick={onClickRemove}>삭제</Button>
        </ModalFooter>
      </Modal> : null}

      {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
      {request.loading ? <LoadingSpinner /> : null}

      <h1 className="title-label">멤버 상세 정보</h1>
      {message ? <MessageLabel>{message}</MessageLabel> : null}
      <section className="label_area">
        <p className="label">멤버 이미지</p>
        <img 
            width="200px"
            height="200px"
            src={`${BACKEND}/image/member/${member.image_name}`}
            onError={e => e.target.src = '/no_image.jpg'}
            alt="그룹"
        />
      </section>
      <section className="label_area">
        <p className="label">이름</p>
        <p>{member.name}</p>
      </section>
      <section className="submit_section">
        <Link to={`/admin/group/detail/${groupId}`}><Button className="cancel_button">뒤로 가기</Button></Link>
        <Link to={`/admin/member/writer/${memberId}?groupId=${groupId}`}><Button className="edit_button">수정</Button></Link>
        <Button className="remove_button" onClick={openModal}>삭제</Button>
      </section>
    </AdminTemplate>
  );
};

export default MemberDetailPage;