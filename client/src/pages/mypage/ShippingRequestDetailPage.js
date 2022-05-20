import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { BACKEND } from '../../utils/api';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import { getFormattedDate } from '../../utils/common';
import AuthContext from '../../contexts/Auth';
import Button from '../../components/form/Button';
import Textarea from '../../components/form/Textarea';
import LoadingSpinner from '../../components/LoadingSpinner';
import MessageLabel from '../../components/MessageLabel';
import UserTemplate from '../../templates/UserTemplate';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import VoucherCard from '../../components/card/VoucherCard';
import Modal from '../../components/modal/Modal';
import ModalHeader from '../../components/modal/ModalHeader';
import ModalBody from '../../components/modal/ModalBody';
import ModalFooter from '../../components/modal/ModalFooter';
import produce from 'immer';
import './ShippingRequestDetailPage.scss';


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
const ShippingRequestDetailPage = () => {
  const { state: authState, actions: authActions } = useContext(AuthContext);
  const { requestId } = useParams(); // URL에 포함된 suggestionId Params 정보
  const [requests, setRequests] = useState({ // 문의사항 상세 정보
    username: '', // 요청자
    state: '', // 처리 상태
    payment_price: '',  // 결제 금액
    payment_state: '',  //결제 상태
    regist_time: '' // 요청 등록일
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const request = useRequest();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [VoucherRequest, setVoucherRequest] = useState([]); // 화면에 보여줄 사용 가능한 자신의 소유권 목록
  const [vouchers, setVouchers] = useState([]); // 정식 소유권 목록

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      // 배송 요청 정보 가져오기
      let res = await request.call(api.getShippingDetail, requestId);
      setRequests({
        username: res.requests.username,
        state: res.requests.state,
        payment_price: res.requests.payment_price,
        payment_state: res.requests.payment_state,
        regist_time: res.requests.regist_time
      });
      setVoucherRequest(res.vouchers);  // 배송 요청한 소유권 목록

      // 배송 요청한 소유권 목록 가져오기
      // let res2 = await request.call(api.getVoucherListMine, {
      //   permanent: 1
      // });
      let res2 = await request.call(api.getShippingVoucherListMine, {
        permanent: 1,
        username: res.requests.username
      });
      setVouchers(res2.vouchers);  // 정식 소유권 목록

    } catch (err) {
      setMessage(err.response.data.message);
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  const openRemoveModal = () => setShowRemoveModal(true);
  const closeRemoveModal = () => setShowRemoveModal(false);

  // 결제하기 버튼 클릭시
  const onClickPayment = async (e) => {
    try {
      const res = await request.call(api.getShippingPayment, requestId);
      console.log(res);

      // 아임포트 서버에 거래 요청
      const { IMP } = window;
      IMP.init(res.impcode);
      IMP.request_pay(res.payment, async (response) => {
        const { success, imp_uid, merchant_uid, error_msg } = response;
        console.log(response);

        if (success) {
          let res = await request.call(api.postPaymentConfirmation, imp_uid, merchant_uid);
          console.log(res);

          // 배송 요청 정보 가져오기 (결제 상태등 리프레쉬해서 보여주기위함)
          res = await request.call(api.getShippingDetail, requestId);
          setRequests({
            username: res.requests.username,
            state: res.requests.state,
            payment_price: res.requests.payment_price,
            payment_state: res.requests.payment_state,
            regist_time: res.requests.regist_time
          });
        } else {
          console.log("결제 실패: " + error_msg);
        }

        return navigate(`/mypage/shipping/detail/${requestId}`);
      });
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }

  // 배송 요청 취소
  const onClickRemove = async (e) => {
    try {
      const res = await request.call(api.deleteShippingRequest, requestId);
      console.log(res);
      return navigate('/mypage/shipping');
    } catch (err) {
      setMessage(err.response.data.message);
    }
    closeRemoveModal();
  }

  return (
    <UserTemplate className="ShippingRequestDetailPage" sidebar={<MyPageSidebar />}>

      {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
      {request.loading ? <LoadingSpinner /> : null}

      {/* 요청 취소 모달창 */}
      {showRemoveModal ?
      <Modal className="add_modal" onClose={closeRemoveModal}>
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
        <p className="label">결제 상태</p>
        <p>{PaymentState[requests.payment_state]}</p>
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
        {authState.user.username === requests.username &&
        requests.payment_state === 'waiting' &&
        <Button className="edit_button" onClick={onClickPayment}>결제하기</Button>}
        {requests.payment_state === 'waiting' && <Button className="remove_button" onClick={openRemoveModal}>요청 취소</Button>}
        <Link to="/mypage/shipping"><Button className="cancel_button">뒤로 가기</Button></Link>
      </section>
    </UserTemplate>
  );
};

export default ShippingRequestDetailPage;