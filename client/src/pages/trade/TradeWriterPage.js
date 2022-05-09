import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import produce from 'immer';
import qs from 'qs';
import classNames from 'classnames';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import { BACKEND } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import MessageLabel from '../../components/MessageLabel';
import Select from '../../components/form/Select';
import ImageCard from '../../components/card/ImageCard';
import VoucherCard from '../../components/card/VoucherCard';
import Button from '../../components/form/Button';
import Input from '../../components/form/Input';
import Modal from '../../components/modal/Modal';
import ModalHeader from '../../components/modal/ModalHeader';
import ModalBody from '../../components/modal/ModalBody';
import ModalFooter from '../../components/modal/ModalFooter';
import TradeSideBar from '../../components/sidebar/TradeSideBar';
import UserTemplate from '../../templates/UserTemplate';
import './TradeWriterPage.scss';

const TradeWriterPage = () => {
  const { tradeId } = useParams(); // URL에 포함된 albumId Params 정보
  const [form, setForm] = useState({
    haveVoucherId: '',
    wantPhotocardId: '', // 포토카드 추가 모달 창에서 사용될 변수
    wantPhotocards: [], // 사용자에 의해 추가된 원하는 포토카드 목록
    wantAmount: ''
  });
  const [select, setSelect] = useState({
    permanent: '1',
    state: '',
    have: {
      groupId: '',
      memberId: '',
      members: []
    },
    want: {
      groupId: '',
      memberId: '',
      members: []
    }
  });
  const [groups, setGroups] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [photocards, setPhotocards] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false); // 받으려는 포토카드 추가 모달 창 화면에 띄우기 on/off
  const [message, setMessage] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const request = useRequest();
  const navigate = useNavigate();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.getGroupList);
      setGroups(res.groups);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }
  useEffect(() => { onLoad(); }, []);

  // 화면에 보여줄 소유권 목록 업데이트
  const onUpdateVouchers = async (e) => {
    if (select.have.groupId === '' || select.have.memberId === '') {
      setVouchers([]);
      return;
    }

    try {
      const res = await request.call(api.getVoucherListMine, {
        permanent: select.permanent,
        state: select.state,
        groupId: select.have.groupId,
        memberId: select.have.memberId
      });
      setVouchers(res.vouchers);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };
  useEffect(() => { onUpdateVouchers(); }, [select.permanent, select.have, select.state]);

  // 화면에 보여줄 포토카드 목록 업데이트
  const onUpdatePhotocards = async (e) => {
    if (select.want.groupId === '' || select.want.memberId === '') {
      setPhotocards([]);
      return;
    }

    try {
      const res = await request.call(api.getPhotocardList, select.want.groupId, select.want.memberId);
      setPhotocards(res.photocards);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };
  useEffect(() => { onUpdatePhotocards(); }, [select.want]);

  // 받으려는 포토카드 추가 모달 열기 / 닫기
  const openAddModal = () => setShowAddModal(true);
  const closeAddModal = () => {
    setModalMessage('');
    setShowAddModal(false);
  }

  // 받으려는 포토카드 추가 모달에서 추가 버튼 클릭시
  const onClickAddPhotocardButton = () => {
    if (form.wantPhotocards.find(element => element.photocard_id === parseInt(form.wantPhotocardId)))
      return setModalMessage('이미 받으려는 포토카드로 추가한 포토카드입니다.');
    if (!form.wantPhotocardId) return setModalMessage('받을 포토카드를 선택해주세요.');

    // 받으려는 포토카드 목록에 해당 포토카드 정보 추가
    setForm(produce(draft => {
      draft.wantPhotocards = draft.wantPhotocards.concat(photocards.find(element => element.photocard_id === parseInt(form.wantPhotocardId)));
      draft.wantPhotocardId = '';
    }));

    closeAddModal();
  }

  // 받으려는 포토카드 목록에서 취소 버튼 클릭시
  const onClickRemovePhotocardButton = (e) => {
    const value = e.target.value;

    setForm(produce(draft => {
      draft.wantPhotocards = draft.wantPhotocards.filter(element => element.photocard_id !== parseInt(value));
    }));
  }

  // input 값 변경시
  const onChangeInput = (e) => {
    setForm(produce(draft => {
      draft[e.target.name] = e.target.value;
    }));
  }

  // input에 입력된 값이 숫자인 경우에만 상태 업데이트
  const onChangeNumberInput = (e) => {
    if (!/[^1-9]/.test(e.target.value)) {
      setForm(produce(draft => {
        draft[e.target.name] = e.target.value;
      }));
    }
  }

  // 임시/영구 여부 select 값 변경시
  const onChangePermanentSelect = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setSelect(produce(draft => {
      draft[name] = value;
      // 임시 소유권은 아직 거래를 한 번도 안한 소유권만 선택할 수 있어야함.
      if (value === '0') draft.state = 'initial'
      else draft.state = '';
    }));
  }

  // 그룹 선택 변경시 동작
  const onChangeGroupSelect = async (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setSelect(produce(draft => {
      draft[name].groupId = value;
    }));

    if (value === '') {
      setSelect(produce(draft => {
        draft[name].members = [];
      }));
    } else if (value === 'all') {
      try {
        const res = await request.call(api.getAllMemberList);
        setSelect(produce(draft => {
          draft[name].members = res.members;
        }));
      } catch (err) {
        setMessage(err.response.data.message);
      }
    } else {
      try {
        const res = await request.call(api.getMemberList, value);
        setSelect(produce(draft => {
          draft[name].members = res.members;
        }));
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
  }

  // 멤버 선택 변경시 동작
  const onChangeMemberSelect = async (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setSelect(produce(draft => {
      draft[name].memberId = value;
    }));
  }

  // 사용할 소유권 선택시
  const onClickVoucher = (e) => {
    const target = e.currentTarget;
    const value = target.getAttribute('value');

    setForm(produce(draft => {
      draft.haveVoucherId = value;
    }));
  }

  // 받을 포토카드 선택시
  const onClickPhotocard = (e) => {
    const target = e.currentTarget;
    const value = target.getAttribute('value');

    setForm(produce(draft => {
      draft.wantPhotocardId = value;
    }));
  }

  // 작성 취소 버튼 클릭시
  const onCancel = () => navigate(-1); // 뒤로 돌아가기

  // 작성 버튼 클릭시
  const onSubmit = async (e) => {
    e.preventDefault();
    console.log(form);

    // 새로 작성하는 경우
    if (!tradeId) {
      try {
        const res = await request.call(api.postTradeNew, { ...form, permanent: select.permanent });
        console.log(res);
        return navigate('/trade/all');
      } catch (err) {
        setMessage(err.response.data.message);
      }
    // 내용을 수정하는 경우
    } else {

    }
  }

  return (
    <UserTemplate
      className="TradeWriterPage"
      sidebar={<TradeSideBar />}
    >
      {request.loading ? <LoadingSpinner /> : null}

      {/* 받으려는 포토카드 추가 모달 창 */}
      {showAddModal ?
      <Modal className="add_modal" onClose={closeAddModal}>
        <ModalHeader onClose={closeAddModal}>
          <h1>받으려는 포토카드</h1>
        </ModalHeader>
        <ModalBody>
          <section className="search_area">
            <article className="search">
              <p className="label">그룹</p>
              <Select name="want" value={select.want.groupId} onChange={onChangeGroupSelect}>
                <option value="">선택</option>
                <option value="all">전체</option>
                {groups ?
                groups.map(group => 
                  <option key={group.group_id} value={group.group_id}>{group.name}</option>
                ) : null}
              </Select>
            </article>

            <article className="search">
              <p className="label">멤버</p>
              <Select name="want" value={select.want.memberId} onChange={onChangeMemberSelect}>
                <option value="">선택</option>
                <option value="all">전체</option>
                {select.want.members ?
                select.want.members.map(member =>
                  <option key={member.member_id} value={member.member_id}>{member.name}</option>
                ) : null}
              </Select>
            </article>
          </section>

          <section className="card_section">
            {photocards ?
              photocards.map(photocard =>
                <VoucherCard
                  className={classNames({"active": photocard.photocard_id === parseInt(form.wantPhotocardId) })}
                  key={photocard.photocard_id}
                  value={photocard.photocard_id}
                  name={photocard.name}
                  albumName={photocard.album_name}
                  src={`${BACKEND}/image/photocard/${photocard.image_name}`}
                  onClick={onClickPhotocard}
                />
              ) : null}
          </section>
          {modalMessage && <MessageLabel>{modalMessage}</MessageLabel>}
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeAddModal}>취소</Button>
          <Button className="submit_button" onClick={onClickAddPhotocardButton}>추가</Button>
        </ModalFooter>
      </Modal> : null}

      <form onSubmit={onSubmit}>
        {tradeId ?
        <h1 className="title-label">교환글 수정</h1> :
        <h1 className="title-label">교환글 등록</h1>}

        {message ? <MessageLabel>{message}</MessageLabel> : null}

        <p className="label">사용하려는 소유권 선택</p>
        <section className="search_area">
          <article className="search">
            <p className="label">정식 여부</p>
            <Select name="permanent" value={select.permanent} onChange={onChangePermanentSelect}>
              <option value="0">임시</option>
              <option value="1">정식</option>
            </Select>
          </article>

          <article className="search">
            <p className="label">그룹</p>
            <Select name="have" value={select.have.groupId} onChange={onChangeGroupSelect}>
              <option value="">선택</option>
              <option value="all">전체</option>
              {groups ?
              groups.map(group => 
                <option key={group.group_id} value={group.group_id}>{group.name}</option>
              ) : null}
            </Select>
          </article>

          <article className="search">
            <p className="label">멤버</p>
            <Select name="have" value={select.have.memberId} onChange={onChangeMemberSelect}>
              <option value="">선택</option>
              <option value="all">전체</option>
              {select.have.members ?
              select.have.members.map(member =>
                <option key={member.member_id} value={member.member_id}>{member.name}</option>
              ) : null}
            </Select>
          </article>
        </section>

        <section className="card_section">
          {vouchers ?
            vouchers.map(v =>
              <VoucherCard
                className={classNames({"active": v.voucher_id === parseInt(form.haveVoucherId) })}
                key={v.voucher_id}
                value={v.voucher_id}
                name={v.name}
                albumName={v.album_name}
                src={`${BACKEND}/image/photocard/${v.image_name}`}
                onClick={onClickVoucher}
              />
            ) : null}
        </section>

        <div className="label_area">
          <p className="label">받으려는 포토카드</p>
          <Button className="add_button" onClick={openAddModal}>추가</Button>
        </div>

        <section className="card_section">
          {form.wantPhotocards ?
            form.wantPhotocards.map(photocard =>
              <VoucherCard
                key={photocard.photocard_id}
                name={photocard.name}
                albumName={photocard.album_name}
                src={`${BACKEND}/image/photocard/${photocard.image_name}`}
              >
                <Button className="remove_button" value={photocard.photocard_id} onClick={onClickRemovePhotocardButton}>취소</Button>
              </VoucherCard>
            ) : null}
        </section>

        <p className="label">받으려는 포토카드 개수</p>
        <Input
          type="text"
          name="wantAmount"
          value={form.wantAmount}
          maxLength="1"
          autoComplete="off"
          placeholder="받으려는 포토카드의 개수를 입력하세요 (숫자)"
          onChange={onChangeNumberInput}
        />

        <section className="submit_section">
          <Button className="cancel_button" type="button" onClick={onCancel}>취소</Button>
          <Button className="submit_button" type="submit">작성</Button>
        </section>

      </form>
    </UserTemplate>
  );
};

export default TradeWriterPage;