import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BACKEND } from '../../../utils/api';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { getFormattedDate } from '../../../utils/common';
import Button from '../../../components/form/Button';
import Textarea from '../../../components/form/Textarea';
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
  'waiting': '요청 처리 전',
  'finished': '처리 완료'
}

// 결제 상태에 따라 화면에 보여줄 텍스트
const PaymentState = {
  'waiting': '결제 대기중',
  'paid': '결제 완료',
  'forgery': '위조된 결제'
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
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const request = useRequest();
  const [VoucherRequest, setVoucherRequest] = useState([]); // 화면에 보여줄 사용 가능한 자신의 소유권 목록
  const [vouchers, setVouchers] = useState([]); // 정식 소유권 목록
  const [groups, setGroups] = useState([]);

  //모달 창 열기 / 닫기
  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    navigate(0);
  }
  const [showModal, setShowModal] = useState(false); // 모달 창 화면에 띄우기 on/off

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

  const onClickState = async () => {
    try {
      let res = await request.call(api.postSetState, requestId);
      console.log(res);

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

    } catch (err) {
      setMessage(err.response.data.message);
    }
  };

  return (
    <AdminTemplate className="ShippingDetailPage">

      {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
      {request.loading ? <LoadingSpinner /> : null}

      {/* 모달 창 */}
      {showModal ?
      <Modal onClose={closeModal}>
        <ModalHeader onClose={closeModal}>
          <h1>배송요청 처리</h1>
        </ModalHeader>
        <ModalBody>
          <p>{message ? <MessageLabel>{message}</MessageLabel> : null}</p>
        </ModalBody>
        <ModalFooter>
          <Button className="submit_button" onClick={closeModal}>확인</Button>
        </ModalFooter>
      </Modal> : null}

      <h1 className="title-label">배송 요청 상세 정보</h1>
      {message ? <MessageLabel>{message}</MessageLabel> : null}
      <section className="label_area">
        <p className="label">요청자</p>
        <p>{requests.username}</p>
      </section>
      <section className="label_area">
        <p className="label">배송 요청 처리 상태</p>
        <p>{ShippingState[requests.state]}</p>
      </section>
      <section className="label_area">
        <p className="label">결제 금액</p>
        <p>{requests.payment_price}</p>
      </section>
      <section className="label_area">
        <p className="label">결제 상태</p>
        <p>{PaymentState[requests.payment_state]}</p>
      </section>
      <section className="label_area">
        <p className="label">이름</p>
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
        <p className="label">작성일</p>
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
        {requests.state === 'waiting' && <Button className="add_button" onClick={onClickState}>발송 완료 처리</Button>}
        {/* {requests.state==='waiting' ? <Button className="add_button" onClick={onClickState}>배송 요청 처리</Button>: 
        <Button className="add_button" onClick={onClickState}>배송 요청 처리 취소</Button>} */}
      </section>
    </AdminTemplate>
  );
};

export default ShippingDetailPage;