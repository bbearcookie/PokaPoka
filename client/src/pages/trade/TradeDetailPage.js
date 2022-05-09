import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import produce from 'immer';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import { BACKEND } from '../../utils/api';
import Button from '../../components/form/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Select from '../../components/form/Select';
import Input from '../../components/form/Input';
import Modal from '../../components/modal/Modal';
import ModalHeader from '../../components/modal/ModalHeader';
import ModalBody from '../../components/modal/ModalBody';
import ModalFooter from '../../components/modal/ModalFooter';
import MessageLabel from '../../components/MessageLabel';
import TradeList from '../../components/list/TradeList';
import VoucherCard from '../../components/card/VoucherCard';
import TradeCard from '../../components/card/TradeCard';
import TradeSideBar from '../../components/sidebar/TradeSideBar';
import UserTemplate from '../../templates/UserTemplate';
import './TradeDetailPage.scss';

// 카드에 보여줄 임시 or 영구 소유권 여부
const permanentState = {
  0: 'temporary',
  1: 'permanent'
};

const TradeDetailPage = () => {
  const { tradeId } = useParams(); // URL에 포함된 Params 정보
  const [form, setForm] = useState({
    selectVoucher: '', // 소유권 사용 모달 창에서 사용될 변수
    useVouchers: [] // 사용하기로 등록한 소유권 목록
  });
  const [trade, setTrade] = useState({}); // 교환글 상세 정보
  const [vouchers, setVouchers] = useState([]); // 화면에 보여줄 사용 가능한 자신의 소유권 목록
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const request = useRequest();
  const navigate = useNavigate();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.getTradeDetail, tradeId);
      setTrade(res.trade);
      const res2 = await request.call(api.getTradeWantcardMine, tradeId);
      setVouchers(res2.vouchers);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }
  useEffect(() => { onLoad(); }, []);

  // 받으려는 포토카드 추가 모달 열기 / 닫기
  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => {
    setModalMessage('');
    setShowAddModal(false);
  }

  // 사용할 소유권 선택시
  const onClickVoucher = (e) => {
    const target = e.currentTarget;
    const value = target.getAttribute('value');

    setForm(produce(draft => {
      draft.selectVoucher = value;
    }));
  }

  // 소유권 선택 모달에서 추가 버튼 클릭시
  const onClickAddVoucherButton = () => {
    if (form.useVouchers.find(element => element.voucher_id === parseInt(form.selectVoucher)))
      return setModalMessage('이미 받으려는 포토카드로 추가한 포토카드입니다.');
    if (!form.selectVoucher) return setModalMessage('받을 포토카드를 선택해주세요.');

    // 받으려는 포토카드 목록에 해당 포토카드 정보 추가
    setForm(produce(draft => {
      draft.useVouchers = draft.useVouchers.concat(vouchers.find(element => element.voucher_id === parseInt(form.selectVoucher)));
      draft.selectVoucher = '';
    }));

    closeAddModal();
  }

  // 사용하려는 소유권 목록에서 취소 버튼 클릭시
  const onClickRemoveVoucherButton = (e) => {
    const value = e.target.value;

    setForm(produce(draft => {
      draft.useVouchers = draft.useVouchers.filter(element => element.voucher_id !== parseInt(value));
    }));
  }


  // 뒤로가기 버튼 클릭시
  const onBackButton = () => navigate(-1); // 뒤로 돌아가기

  // 교환 신청 버튼 클릭시
  const onSubmit = (e) => {
    e.preventDefault();
    console.log(form);
  }

  return (
    <UserTemplate
      className="TradeDetailPage"
      sidebar={<TradeSideBar />}
    >
      {request.loading ? <LoadingSpinner /> : null}

      {/* 포토카드 소유권 선택 모달 창 */}
      {showAddModal ?
      <Modal className="add_modal" onClose={closeAddModal}>
        <ModalHeader onClose={closeAddModal}>
          <h1>교환할 포토카드 소유권 선택</h1>
        </ModalHeader>
        <ModalBody>
          {modalMessage && <MessageLabel>{modalMessage}</MessageLabel>}

          <section className="card_section">
            {vouchers ?
              vouchers.map(voucher =>
                <VoucherCard
                  className={classNames({"active": voucher.voucher_id === parseInt(form.selectVoucher) })}
                  key={voucher.voucher_id}
                  value={voucher.voucher_id}
                  name={voucher.name}
                  albumName={voucher.album_name}
                  src={`${BACKEND}/image/photocard/${voucher.image_name}`}
                  onClick={onClickVoucher}
                />
              ) : null}
          </section>
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeAddModal}>취소</Button>
          <Button className="submit_button" onClick={onClickAddVoucherButton}>추가</Button>
        </ModalFooter>
      </Modal>
      : null}

      <h1 className="title-label">교환글 상세 정보</h1>
      <TradeCard
        key={trade.trade_id}
        tradeId={trade.trade_id}
        username={trade.username}
        name={trade.name}
        imageName={trade.image_name}
        albumName={trade.album_name}
        state={trade.state}
        permanentState={permanentState[trade.permanent]}
        registTime={trade.regist_time}
        wantAmount={trade.want_amount}
        wantcards={trade.wantcards}
      />

      <section className="submit_section">
        <Button className="cancel_button" type="button" onClick={onBackButton}>뒤로가기</Button>
        <Button className="edit_button">수정</Button>
        <Button className="submit_button">삭제</Button>
      </section>

      <form onSubmit={onSubmit}>
        <h1 className="title-label">교환 신청</h1>
        {message ? <MessageLabel>{message}</MessageLabel> : null}

        <div className="label_area">
          <p className="label">소유권 선택</p>
          <Button className="add_button" onClick={openAddModal}>추가</Button>
        </div>

        <section className="card_section">
          {form.useVouchers ?
            form.useVouchers.map(voucher =>
              <VoucherCard
                key={voucher.voucher_id}
                name={voucher.name}
                albumName={voucher.album_name}
                src={`${BACKEND}/image/photocard/${voucher.image_name}`}
              >
                <Button className="remove_button" value={voucher.voucher_id} onClick={onClickRemoveVoucherButton}>취소</Button>
              </VoucherCard>
            ) : null}
        </section>

        <section className="submit_section">
          <Button className="submit_button" type="submit">신청</Button>
        </section>
      </form>

    </UserTemplate>
  );
};

export default TradeDetailPage;