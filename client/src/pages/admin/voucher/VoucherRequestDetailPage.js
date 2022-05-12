import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import produce from 'immer';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { getFormattedDate } from '../../../utils/common';
import Button from '../../../components/form/Button';
import Textarea from '../../../components/form/Textarea';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import ImageCard from '../../../components/card/ImageCard';
import Badge from '../../../components/Badge';
import Modal from '../../../components/modal/Modal';
import ModalHeader from '../../../components/modal/ModalHeader';
import ModalBody from '../../../components/modal/ModalBody';
import ModalFooter from '../../../components/modal/ModalFooter';
import AdminTemplate from '../../../templates/AdminTemplate';
import { BACKEND } from '../../../utils/api';
import './VoucherRequestDetailPage.scss';

// 발급 요청의 처리 상태에 따라 화면에 보여줄 텍스트
const suggestionState = {
  'waiting': '발급 대기중',
  'temporary': '임시 소유권 발급',
  'finished': '발급 완료'
}

// 발급 요청 상세 조회 페이지
const VoucherRequestDetailPage = () => {
  const { requestId } = useParams(); // URL에 포함된 requestId Params 정보
  const [voucherRequest, setVoucherRequest] = useState({ // 발급 요청 상세 정보
    request_id: '',
    username: '',
    photocard_id: '',
    delivery: '',
    tracking_number: '',
    state: '',
    regist_time: '',
    image_name: ''
  });
  const [photocard, setPhotocard] = useState({
    name: '',
    image_name: ''
  });
  const [showRemoveModal, setShowRemoveModal] = useState(false); // 삭제 모달 창 화면에 띄우기 on/off
  const [showProvisionModal, setShowProvisionModal] = useState(false); // 삭제 모달 창 화면에 띄우기 on/off
  const [showCancelModal, setShowCancelModal] = useState(false); // 발급 취소 모달 창 화면에 띄우기 on/off
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const request = useRequest();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      // 목록 정보 가져오기
      let res = await request.call(api.getVoucherRequestDetail, requestId);
      setVoucherRequest({
        request_id: res.request.request_id,
        username: res.request.username,
        photocard_id: res.request.photocard_id,
        delivery: res.request.delivery,
        tracking_number: res.request.tracking_number,
        state: res.request.state,
        regist_time: res.request.regist_time,
        image_name: res.request.image_name
      });
      setPhotocard({
        name: res.photocard.name,
        image_name: res.photocard.image_name
      });
      console.log(res);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  // 삭제 모달 열기 / 닫기
  const openRemoveModal = () => setShowRemoveModal(true);
  const closeRemoveModal = () => setShowRemoveModal(false);

  // 발급 모달 열기 / 닫기
  const openProvisionModal = () => setShowProvisionModal(true);
  const closeProvisionModal = () => setShowProvisionModal(false);

  // 발급 취소 모달 열기 / 닫기
  const openCancelModal = () => setShowCancelModal(true);
  const closeCancelModal = () => setShowCancelModal(false);

  // 발급 버튼 클릭시
  const onClickProvision = async () => {
    if (!voucherRequest.state) return; // 값이 비정상적으로 비어있으면 처리 안함

    // 아직 발급하기 전인 경우 임시 소유권을 발급해줌.
    if (voucherRequest.state === 'waiting') {
      try {
        const res = await request.call(api.postVoucherProvisionByRequest, requestId);
        onLoad();
      } catch (err) {
        setMessage(err.response.data.message);
      }
    // 이미 발급이 되어 있는 경우 임시 소유권을 영구 소유권으로 변경해줌.
    } else {
      try {
        const res = await request.call(api.putVoucherProvisionByRequest, requestId);
        onLoad();
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
    closeProvisionModal();
  }
  
  // 발급 취소 버튼 클릭시
  const onClickProvisionCancel = async () => {
    try {
      const res = await request.call(api.postVoucherRevert, requestId);
      onLoad();
    } catch (err) {
      setMessage(err.response.data.message);
    }
    closeCancelModal();
  }

  // 삭제 버튼 클릭시
  const onClickRemove = async () => {
    try {
      const res = await request.call(api.deleteVoucherRequest, requestId);
      return navigate('/admin/voucher/request');
    } catch (err) {
      setMessage(err.response.data.message);
    }
    closeRemoveModal();
  }

  return (
    <AdminTemplate className="AdminVoucherRequestDetailPage">

      {/* 삭제 버튼 눌리면 삭제 모달 창 띄움 */}
      {showRemoveModal ?
      <Modal className="remove_modal" onClose={closeRemoveModal}>
        <ModalHeader onClose={closeRemoveModal}>
          <h1>소유권 요청 삭제</h1>
        </ModalHeader>
        <ModalBody>
          <p>{voucherRequest.username} 님의 소유권 요청을 삭제하시겠습니까?</p>
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeRemoveModal}>취소</Button>
          <Button className="remove_button" onClick={onClickRemove}>삭제</Button>
        </ModalFooter>
      </Modal> : null}

      {/* 발급 버튼 눌리면 발급 모달 창 띄움 */}
      {showProvisionModal ?
      <Modal className="remove_modal" onClose={closeProvisionModal}>
        <ModalHeader onClose={closeProvisionModal}>
          {voucherRequest.state === 'waiting' && <h1>임시 소유권 발급</h1>}
          {voucherRequest.state === 'temporary' && <h1>영구 소유권 발급</h1>}
        </ModalHeader>
        <ModalBody>
          {voucherRequest.state === 'waiting' && <p>{voucherRequest.username} 님에게 임시 소유권을 발급하시겠습니까?</p>}
          {voucherRequest.state === 'temporary' && <p>{voucherRequest.username} 님에게 발급한 임시 소유권을 <br/>영구적으로 발급하시겠습니까?</p>}
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeProvisionModal}>취소</Button>
          <Button className="edit_button" onClick={onClickProvision}>발급</Button>
        </ModalFooter>
      </Modal> : null}

      {/* 발급 취소 버튼 눌리면 삭제 모달 창 띄움 */}
      {showCancelModal ?
      <Modal className="remove_modal" onClose={closeCancelModal}>
        <ModalHeader onClose={closeCancelModal}>
          <h1>임시 소유권 발급 취소</h1>
        </ModalHeader>
        <ModalBody>
          <p>{voucherRequest.username} 님의 임시 소유권을 발급 취소하시겠습니까?</p>
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeCancelModal}>아니오</Button>
          <Button className="remove_button" onClick={onClickProvisionCancel}>예</Button>
        </ModalFooter>
      </Modal> : null}

      {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
      {request.loading ? <LoadingSpinner /> : null}

      <h1 className="title-label">포토카드 소유권 요청 상세 정보</h1>
      {message ? <MessageLabel>{message}</MessageLabel> : null}
      <section className="label_area">
        <p className="label">받으려는 포토카드</p>
        <Link to={`/admin/photocard/detail/${voucherRequest.photocard_id}?backURI=/admin/voucher/request/detail/${voucherRequest.request_id}`}>
          <ImageCard
            key={voucherRequest.photocard_id}
            name={photocard.name}
            src={`${BACKEND}/image/photocard/${photocard.image_name}`}
          />
        </Link>
      </section>
      <section className="label_area">
        <p className="label">실물 이미지</p>
        <img 
            width="200px"
            height="200px"
            src={`${BACKEND}/image/voucher/${voucherRequest.image_name}`}
            onError={e => e.target.src = '/no_image.jpg'}
            alt="포토카드"
        />
      </section>
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
        {voucherRequest.state !== 'finished' && <Button className="edit_button" onClick={openProvisionModal}>발급</Button>}
        {voucherRequest.state === 'temporary' && <Button className="remove_button" onClick={openCancelModal}>발급 취소</Button>}
        {voucherRequest.state === 'waiting' && <Button className="remove_button" onClick={openRemoveModal}>삭제</Button>}
        
      </section>
    </AdminTemplate>
  );
};

export default VoucherRequestDetailPage;