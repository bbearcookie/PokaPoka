import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import produce from 'immer';
import classNames from 'classnames';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import { BACKEND } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/form/Button';
import MessageLabel from '../../components/MessageLabel';
import Select from '../../components/form/Select';
import VoucherCard from '../../components/card/VoucherCard';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import Payment from '../../components/payment';
import Modal from '../../components/modal/Modal';
import ModalHeader from '../../components/modal/ModalHeader';
import ModalBody from '../../components/modal/ModalBody';
import ModalFooter from '../../components/modal/ModalFooter';
import './ShippingRequestPage.scss';

//마이페이지 - 배송 요청
const ShippingRequestPage = () => {
  const request = useRequest();
  const [users,setUsers]=useState({ // 배송 정보
    name: '',
    phone: '',
    address: ''
});
const [form, setForm] = useState({
  selectVoucher: '',
  useVouchers: [] // 사용하기로 등록한 소유권 목록
});
const [visible, setVisible] = useState(false);  // 주소 데이터가 있을 때와 없을 때 구분
const [vouchers, setVouchers] = useState([]); // 화면에 보여줄 사용 가능한 자신의 소유권 목록
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [message, setMessage] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.getVoucherListMine, {
        permanent: 1
      });
      setVouchers(res.vouchers);
      console.log(res.vouchers);
      const res3 = await request.call(api.getAddress);
      if(res3.user.address) setVisible(true);    // 주소가 있다면 배송 정보 출력
      setUsers({
          name: res3.user.name,
          phone: res3.user.phone,
          address: res3.user.address
        });
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => {
    setModalMessage('');
    setShowAddModal(false);
  }

  // 소유권 선택 모달에서 추가 버튼 클릭시
  const onClickAddVoucherButton = () => {
    if (form.useVouchers.find(element => element.voucher_id === parseInt(form.selectVoucher)))
      return setModalMessage('이미 사용하기로 등록한 소유권입니다.');
    if (!form.selectVoucher) return setModalMessage('사용할 소유권을 선택해주세요.');

    // 받으려는 포토카드 목록에 해당 포토카드 정보 추가
    setForm(produce(draft => {
      //draft.useVouchers = draft.useVouchers.concat(vouchers.find(element => element.voucher_id === parseInt(form.selectVoucher)));
      draft.useVouchers = draft.useVouchers.concat(vouchers.find(element => element.voucher_id === parseInt(form.selectVoucher)));
      draft.selectVoucher = '';
    }));
    console.log("선택한 소유권: "+form.selectVoucher);
    console.log("발송하려는 소유권 목록shippingRequestPage: "+form.useVouchers);

    closeAddModal();
  }

  // 소유권 선택시
  const onClickVoucher = (e) => {
    const target = e.currentTarget;
    const value = target.getAttribute('value');

    setForm(produce(draft => {
      draft.selectVoucher = value;
    }));
  }

  // 사용하려는 소유권 목록에서 취소 버튼 클릭시
  const onClickRemoveVoucherButton = (e) => {
    const value = e.target.value;

    setForm(produce(draft => {
      draft.useVouchers = draft.useVouchers.filter(element => element.voucher_id !== parseInt(value));
    }));
  }

  return (
    <UserTemplate
      className="ShippingRequestPage"
      sidebar={<MyPageSidebar/>}
    >
      {request.loading ? <LoadingSpinner /> : null}
      {message ? <MessageLabel>{message}</MessageLabel> : null}

      {/* 포토카드 소유권 선택 모달 창 */}
      {showAddModal ?
      <Modal className="add_modal" onClose={closeAddModal}>
        <ModalHeader onClose={closeAddModal}>
          <h1>배송할 포토카드 소유권 선택</h1>
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

      <h1 className="title-label">배송 요청</h1>

      {/* <p className="label">보유한 정식 소유권</p>
      <section className='voucher_section'>
        {groups ?
        groups.map(group =>
            <section className="card_section" key={group.group_id}>
            {vouchers.find(v => v.group_id === group.group_id) &&
            <p className="label">{group.name}</p>}
            {vouchers.filter(v => v.group_id === group.group_id).map(v =>
                <VoucherCard
                className={classNames({"active": v.voucher_id === parseInt(form.voucherId) })}
                key={v.voucher_id}
                value={v.voucher_id}
                name={v.name}
                albumName={v.album_name}
                src={`${BACKEND}/image/photocard/${v.image_name}`}
                onClick={onClickVoucher}
                />
            )}
            </section>
        ) : null}
      </section> */}

      {/* -----------------------------------------------------------수정중 시작-----------------------------------------------------------*/}
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
      {/* -----------------------------------------------------------수정중 끝-----------------------------------------------------------*/}

      <p className="label">배송 정보</p>
      <section className="delivery">
        <form>
            {visible && <h1>{users.name}</h1>}
            {visible && <h1>{users.phone}</h1>}
            {visible ? (<h1>{users.address}</h1>) : (<p className='none'>아직 등록된 주소가 없습니다.</p>)}
            {visible ?  null : <Link to={"/mypage/deliveryinfo"}><Button className="btn">등록 페이지로 이동</Button></ Link>}
        </form>
      </section>
      <p className="label">결제 정보</p>
      <section className="delivery">
        <form>
            <h1>결제 금액: 10원(테스트 금액)</h1>
        </form>
      </section>
      <Payment users={users} vouchers={form} />
    </UserTemplate>
  );
};

export default ShippingRequestPage;