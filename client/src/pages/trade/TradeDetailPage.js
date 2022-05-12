import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import qs from 'qs';
import classNames from 'classnames';
import produce from 'immer';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import { BACKEND } from '../../utils/api';
import AuthContext from '../../contexts/Auth';
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
  const { backURI } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  const { state: authState, actions: authActions } = useContext(AuthContext);
  const [form, setForm] = useState({
    selectVoucher: '', // 소유권 사용 모달 창에서 사용될 변수
    useVouchers: [] // 사용하기로 등록한 소유권 목록
  });
  const [trade, setTrade] = useState({ // 교환글 상세 정보
    state: ''
  });
  const [vouchers, setVouchers] = useState([]); // 화면에 보여줄 사용 가능한 자신의 소유권 목록
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
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

  // 교환글 삭제 모달 열기 / 닫기
  const openRemoveModal = () => setShowRemoveModal(true);
  const closeRemoveModal = () => setShowRemoveModal(false);

  // 사용할 소유권 선택시
  const onClickVoucher = (e) => {
    const target = e.currentTarget;
    const value = target.getAttribute('value');

    setForm(produce(draft => {
      draft.selectVoucher = value;
    }));
  }

  // 찜하기 버튼 클릭시
  const onClickFavorite = async (e) => {
    e.stopPropagation();
    const tradeId = e.currentTarget.getAttribute('trade_id');

    try {
      const res = await request.call(api.postTradeFavorite, tradeId);
      setTrade({ ...trade, favorites: res.favorites });
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }

  // 소유권 선택 모달에서 추가 버튼 클릭시
  const onClickAddVoucherButton = () => {

    // 사용할 소유권 선택했는지 확인
    if (!form.selectVoucher) return setModalMessage('사용할 소유권을 선택해주세요.');

    // 같은 소유권은 선택 불가
    if (form.useVouchers.find(element => element.voucher_id === parseInt(form.selectVoucher)))
      return setModalMessage('이미 사용하기로 등록한 소유권입니다.');

    // 같은 종류의 포토카드는 하나만 등록 가능
    let selectVoucher = vouchers.find(element => element.voucher_id === parseInt(form.selectVoucher));
    if (form.useVouchers.find(element => element.photocard_id === selectVoucher.photocard_id && element.voucher_id !== selectVoucher.voucher_id)) {
      return setModalMessage('같은 종류의 포토카드는 하나의 소유권만 선택 가능합니다.');
    }

    // 사용하려는 소유권 목록에 해당 소유권 정보 추가
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
  const onBackButton = () => {
    return navigate(backURI ? backURI : '/trade/all'); // 뒤로 돌아가기
  }

  // 교환글 삭제시
  const onRemove = async (e) => {
    console.log('onremove');
    try {
      const res = await request.call(api.deleteTrade, tradeId);
      console.log(res);
      return navigate('/trade/all');
    } catch (err) {
      setMessage(err.response.data.message);
    }
    closeRemoveModal();
  }

  // 교환 신청 버튼 클릭시
  const onSubmit = async (e) => {
    e.preventDefault();
    console.log(form);
    try {
      const res = await request.call(api.postTradeTransaction, form, tradeId);
      setMessage('');
      onLoad();
    } catch (err) {
      setMessage(err.response.data.message);
    }
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

      {/* 교환글 삭제 모달 */}
      {showRemoveModal ?
      <Modal className="remove_modal" onClose={closeRemoveModal}>
        <ModalHeader onClose={closeRemoveModal}>
          <h1>교환글 삭제</h1>
        </ModalHeader>
        <ModalBody>
          <p>정말로 {trade.name}에 대한 교환글을 삭제하시겠습니까?</p>
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeRemoveModal}>취소</Button>
          <Button className="remove_button" onClick={onRemove}>삭제</Button>
        </ModalFooter>
      </Modal>
      : null}

      <h1 className="title-label">교환글 상세 정보</h1>
      {message ? <MessageLabel>{message}</MessageLabel> : null}
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
        favorites={trade.favorites}
        onFavorite={onClickFavorite}
      />

      <section className="submit_section">
        <Button className="cancel_button" type="button" onClick={onBackButton}>뒤로가기</Button>
        
        {authState.user.username === trade.username &&
        trade.state === 'finding' &&
        <>
        <Link to={`/trade/writer/${tradeId}`}><Button className="edit_button">수정</Button></Link>
        <Button className="submit_button" onClick={openRemoveModal}>삭제</Button>
        </>}
        
      </section>

      {/* 교환 신청이 가능한 교환글이면 교환 신청 폼 보여줌  */}
      {trade.state === 'finding' &&
      authState.user.username &&
      authState.user.username !== trade.username &&
      <form onSubmit={onSubmit}>
        <h1 className="title-label">교환 신청</h1>

        <div className="label_area">
          <p className="label">사용할 소유권 선택</p>
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
      }

    </UserTemplate>
  );
};

export default TradeDetailPage;