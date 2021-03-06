import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BACKEND } from '../../../utils/api';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { getFormattedDate } from '../../../utils/common';
import Button from '../../../components/form/Button';
import Textarea from '../../../components/form/Textarea';
import Input from '../../../components/form/Input';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import AdminTemplate from '../../../templates/AdminTemplate';
import VoucherCard from '../../../components/card/VoucherCard';
import Modal from '../../../components/modal/Modal';
import ModalHeader from '../../../components/modal/ModalHeader';
import ModalBody from '../../../components/modal/ModalBody';
import ModalFooter from '../../../components/modal/ModalFooter';
import produce from 'immer';
import './ShippingDetailPage.scss';


// 배송 요청 처리 상태에 따라 화면에 보여줄 텍스트
const ShippingState = {
  'waiting': '대기중',
  'finished': '발송 완료'
}

// 결제 상태에 따라 화면에 보여줄 텍스트
const PaymentState = {
  'waiting': '결제 대기중',
  'paid': '결제 완료',
  'forgery': '위조됨' 
}

// 문의사항 상세 조회 페이지
const ShippingDetailPage = () => {
  const { requestId } = useParams(); // URL에 포함된 suggestionId Params 정보
  const [requests, setRequests] = useState({ // 문의사항 상세 정보
    username: '', // 요청자
    state: '', // 처리 상태
    payment_price: '',  // 결제 금액
    payment_state: '',  //결제 상태
    regist_time: '', // 요청 등록일
    name: '',
    address: '',
    phone: ''
  });
  const [form, setForm] = useState({ // 발송 처리 정보
    delivery: '',
    trackingNumber: ''
  })
  const [message, setMessage] = useState('');
  const [sendModalMessage, setSendModalMessage] = useState('');
  const navigate = useNavigate();
  const request = useRequest();
  const [showSendModal, setShowSendModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [VoucherRequest, setVoucherRequest] = useState([]); // 화면에 보여줄 사용 가능한 자신의 소유권 목록
  const [vouchers, setVouchers] = useState([]); // 정식 소유권 목록
  const [groups, setGroups] = useState([]);

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      // 배송 요청 정보 가져오기
      let res = await request.call(api.getShippingDetailAdmin, requestId);
      setRequests({
        username: res.requests.username,
        state: res.requests.state,
        payment_price: res.requests.payment_price,
        payment_state: res.requests.payment_state,
        regist_time: res.requests.regist_time,
        name: res.users.name,
        address: res.users.address,
        phone: res.users.phone,
      });
      setVoucherRequest(res.vouchers);  // 배송 요청한 소유권 목록
      console.log("배송 요청한 소유권");
      console.log(res.vouchers);
      
      console.log(res.requests.username);

      const res2 = await request.call(api.getShippingVoucherListMine, {
        permanent: 1,
        username: res.requests.username
      });
      setVouchers(res2.vouchers);  // 정식 소유권 목록

      console.log(res2.vouchers);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  // 발송 모달 창 열기 / 닫기
  const openSendModal = () => setShowSendModal(true);
  const closeSendModal = () => {
    setSendModalMessage('');
    setShowSendModal(false);
  }

  // 삭제 모달 창 열기 / 닫기
  const openRemoveModal = () => setShowRemoveModal(true);
  const closeRemoveModal = () => setShowRemoveModal(false);

  // 배송 요청 취소
  const onClickRemove = async (e) => {
    try {
      const res = await request.call(api.deleteShippingRequest, requestId);
      return navigate('/admin/shipping');
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }

  // input 값 변경시
  const onChangeInput = (e) => {
    setForm(produce(draft => {
      draft[e.target.name] = e.target.value;
    }));
  }

  // 발송 처리하는 버튼 클릭시
  const onClickSendButton = async () => {
    try {
      let res = await request.call(api.postSetState, requestId, form);

      // 배송 요청 정보 가져오기 (화면 리프레쉬 하기위함)
      res = await request.call(api.getShippingDetailAdmin, requestId);
      setRequests({
        username: res.requests.username,
        state: res.requests.state,
        payment_price: res.requests.payment_price,
        payment_state: res.requests.payment_state,
        regist_time: res.requests.regist_time,
        name: res.users.name,
        address: res.users.address,
        phone: res.users.phone,
      });

      closeSendModal();
    } catch (err) {
      setSendModalMessage(err.response.data.message);
    }
  }

  return (
    <AdminTemplate className="ShippingDetailPage">

      {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
      {request.loading ? <LoadingSpinner /> : null}

      {/* 요청 취소 모달창 */}
      {showRemoveModal ?
      <Modal onClose={closeRemoveModal}>
        <ModalHeader onClose={closeRemoveModal}>
          <h1>배송 요청 취소</h1>
        </ModalHeader>
        <ModalBody>
          <p>등록했던 배송 요청글이 삭제됩니다.</p>
          <p>정말로 배송 요청을 취소하시겠습니까?</p>
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeRemoveModal}>취소</Button>
          <Button className="remove_button" onClick={onClickRemove}>예</Button>
        </ModalFooter>
      </Modal>
      : null}

      {/* 요청 취소 모달창 */}
      {showSendModal ?
      <Modal onClose={closeSendModal}>
        <ModalHeader onClose={closeSendModal}>
          <h1>포토카드 발송</h1>
        </ModalHeader>
        <ModalBody>
          {sendModalMessage ? <MessageLabel>{sendModalMessage}</MessageLabel> : null}
          <p className="label">발송한 택배사</p>
          <Input
            type="text"
            name="delivery"
            value={form.delivery}
            autoComplete="off"
            placeholder="택배사를 입력하세요"
            onChange={onChangeInput}
          />
          <p className="label">운송장 번호</p>
          <Input
            type="text"
            name="trackingNumber"
            value={form.trackingNumber}
            autoComplete="off"
            placeholder="운송장 번호를 입력하세요"
            onChange={onChangeInput}
          />
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeSendModal}>취소</Button>
          <Button className="remove_button" onClick={onClickSendButton}>발송</Button>
        </ModalFooter>
      </Modal>
      : null}

      <h1 className="title-label">배송 요청 상세 정보</h1>
      {message ? <MessageLabel>{message}</MessageLabel> : null}
      <section className="label_area">
        <p className="label">요청자</p>
        <p>{requests.username}</p>
      </section>
      <section className="label_area">
        <p className="label">처리 상태</p>
        <p>{ShippingState[requests.state]}</p>
      </section>
      <section className="label_area">
        <p className="label">결제 상태</p>
        <p>{PaymentState[requests.payment_state]}</p>
      </section>
      <section className="label_area">
        <p className="label">수령인</p>
        <p>{requests.name}</p>
      </section>
      <section className="label_area">
        <p className="label">배송 주소</p>
        <p>{requests.address}</p>
      </section>
      <section className="label_area">
        <p className="label">전화번호</p>
        <p>{requests.phone}</p>
      </section>
      <section className="label_area">
        <p className="label">요청일</p>
        <p>{getFormattedDate(requests.regist_time)}</p>
      </section>
      <p className="label">배송 요청한 소유권</p>
      <section className='voucher_section'>
      {VoucherRequest ?
        VoucherRequest.map(element =>
            <section className="card_section" key={element.voucher_id}>
            {vouchers.filter(v => v.voucher_id === element.voucher_id).map(v =>
                <VoucherCard
                key={v.voucher_id}
                value={v.voucher_id}
                name={v.name}
                albumName={v.album_name}
                src={`${BACKEND}/image/photocard/${v.image_name}`}
                />
            )}
            </section>
        ) : null}
      </section>
      <section className="submit_section">
        <Link to="/admin/shipping"><Button className="cancel_button">뒤로 가기</Button></Link>
        {requests.state === 'waiting' &&
        requests.payment_state === 'paid' && 
        <Button className="edit_button" onClick={openSendModal}>발송</Button>}
        {requests.payment_state === 'waiting' && <Button className="add_button" onClick={openRemoveModal}>요청 삭제</Button>}
      </section>
    </AdminTemplate>
  );
};

export default ShippingDetailPage;