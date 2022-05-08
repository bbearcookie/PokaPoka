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
import TradeSideBar from '../../components/sidebar/TradeSideBar';
import UserTemplate from '../../templates/UserTemplate';
import './TradeWriterPage.scss';

const TradeWriterPage = () => {
  const { tradeId } = useParams(); // URL에 포함된 albumId Params 정보
  const [form, setForm] = useState({
    haveVoucherId: '',
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
  const [photocards, setPhotocards] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [message, setMessage] = useState('');
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

  // input 값 변경시
  const onChangeInput = (e) => {
    setForm(produce(draft => {
      draft[e.target.name] = e.target.value;
    }));
  }

  // input에 입력된 값이 숫자인 경우에만 상태 업데이트
  const onChangeNumberInput = (e) => {
    if (!/[^0-9]/.test(e.target.value)) {
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

  // 화면에 보여줄 소유권 목록 업데이트
  const onUpdateVouchers = async (e) => {
    try {
      if (select.have.groupId === '' || select.have.memberId === '') {
        setVouchers([]);
        return;
      }

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
  useEffect(() => { onUpdateVouchers(); }, [select]);

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

  // 작성 취소 버튼 클릭시
  const onCancel = () => navigate(-1); // 뒤로 돌아가기

  // 작성 버튼 클릭시
  const onSubmit = async (e) => {
    e.preventDefault();
    console.log(form);

    // 새로 작성하는 경우
    if (!tradeId) {

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
      <form onSubmit={onSubmit}>
        {tradeId ?
        <h1 className="title-label">교환글 수정</h1> :
        <h1 className="title-label">교환글 추가</h1>}

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

        <p className="label">받으려는 포토카드 선택</p>
        <p className="label">받으려는 포토카드 갯수</p>
        <Input
          type="text"
          name="want_amount"
          value={form.want_amount}
          maxLength="2"
          autoComplete="off"
          placeholder="받으려는 소유권 갯수를 입력하세요 (숫자)"
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