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
import './VoucherRequestDetailPage.scss';

// 발급 요청의 처리 상태에 따라 화면에 보여줄 텍스트
const suggestionState = {
  'waiting': '발급 대기중',
  'finished': '발급 완료'
}

// 발급 요청 상세 조회 페이지
const VoucherRequestDetailPage = () => {
  const { requestId } = useParams(); // URL에 포함된 requestId Params 정보
  const [voucherRequest, setVoucherRequest] = useState({ // 발급 요청 상세 정보
    username: '',
    photocard_id: '',
    delivery: '',
    tracking_number: '',
    state: '',
    regist_time: ''
  });
  const [showModal, setShowModal] = useState(false); // 삭제 모달 창 화면에 띄우기 on/off
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const request = useRequest();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {

      // 문의사항 정보 가져오기
      let res = await request.call(api.getVoucherRequestDetail, requestId);
      setVoucherRequest({
        username: res.request.username,
        photocard_id: res.request.photocard_id,
        delivery: res.request.delivery,
        tracking_number: res.request.tracking_number,
        state: res.request.state,
        regist_time: res.request.regist_time,
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
    // try {
    //   const res = await request.call(api.deleteSuggestion, suggestionId);
    //   return navigate('/admin/suggestion');
    // } catch (err) {
    //   setMessage(err.response.data.message);
    // }
    closeModal();
  }

  return (
    <AdminTemplate className="AdminVoucherRequestDetailPage">

      {/* 삭제 버튼 눌리면 삭제 모달 창 띄움 */}
      {showModal ?
      <Modal className="remove_modal" onClose={closeModal}>
        <ModalHeader onClose={closeModal}>
          <h1>소유권 요청 삭제</h1>
        </ModalHeader>
        <ModalBody>
          <p>정말로 소유권 요청을 삭제하시겠습니까?</p>
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeModal}>취소</Button>
          <Button className="remove_button" onClick={onClickRemove}>삭제</Button>
        </ModalFooter>
      </Modal> : null}

      {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
      {request.loading ? <LoadingSpinner /> : null}

      <h1 className="title-label">포토카드 소유권 요청 상세 정보</h1>
      {message ? <MessageLabel>{message}</MessageLabel> : null}
      <section className="label_area">
        <p className="label">작성자</p>
        <p>{voucherRequest.username}</p>
      </section>
      <section className="label_area">
        <p className="label">택배사</p>
        <p>{voucherRequest.delivery}</p>
      </section>
      <section className="label_area">
        <p className="label">운송장 번호</p>
        <p>{voucherRequest.tracking_number}</p>
      </section>
      <section className="label_area">
        <p className="label">처리 상태</p>
        <p>{suggestionState[voucherRequest.state]}</p>
      </section>
      <section className="label_area">
        <p className="label">요청일</p>
        <p>{getFormattedDate(voucherRequest.regist_time)}</p>
      </section>
      <section className="submit_section">
        <Link to="/admin/voucher/request"><Button className="cancel_button">뒤로 가기</Button></Link>
        <Button className="remove_button" onClick={openModal}>삭제</Button>
      </section>
    </AdminTemplate>
  );
};

export default VoucherRequestDetailPage;