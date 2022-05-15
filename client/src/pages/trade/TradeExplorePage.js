import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setHaveGroupId, setHaveMemberId, setWantGroupId, setWantMemberId, 
  setVoucherId, setPhotocardId, setGroups, setMembers, setTrades, setHaveVoucher,
  setVouchers, setPhotocards, setExploreMessage } from '../../modules/tradeExplorePage';
import produce from 'immer';
import classNames from 'classnames';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import { BACKEND } from '../../utils/api';
import Button from '../../components/form/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Select from '../../components/form/Select';
import Input from '../../components/form/Input';
import MessageLabel from '../../components/MessageLabel';
import VoucherCard from '../../components/card/VoucherCard';
import TradeExploreList from '../../components/list/TradeExploreList';
import Modal from '../../components/modal/Modal';
import ModalHeader from '../../components/modal/ModalHeader';
import ModalBody from '../../components/modal/ModalBody';
import ModalFooter from '../../components/modal/ModalFooter';
import TradeSideBar from '../../components/sidebar/TradeSideBar';
import UserTemplate from '../../templates/UserTemplate';
import './TradeExplorePage.scss';

const TradeExplorePage = () => {
  // 리덕스 스토어에 저장한 상태값. 페이지 이동시에도 상태를 보관해두기 위함.
  const { have, want, voucherId, photocardId, groups, members, vouchers, photocards, trades, haveVoucher, exploreMessage } = useSelector(state => ({
    have: state.tradeExplorePage.have,
    want: state.tradeExplorePage.want,
    voucherId: state.tradeExplorePage.voucherId,
    photocardId: state.tradeExplorePage.photocardId,
    groups: state.tradeExplorePage.groups,
    members: state.tradeExplorePage.members,
    vouchers: state.tradeExplorePage.vouchers,
    photocards: state.tradeExplorePage.photocards,
    trades: state.tradeExplorePage.trades,
    haveVoucher: state.tradeExplorePage.haveVoucher,
    exploreMessage: state.tradeExplorePage.exploreMessage
  }));
  const dispatch = useDispatch(); // 리듀서 액션 함수를 작동시키는 함수
  const [message, setMessage] = useState('');
  const request = useRequest();
  const navigate = useNavigate();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.getGroupList);
      dispatch(setGroups(res.groups));
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }
  useEffect(() => { onLoad(); }, []);

  // 화면에 보여줄 소유권 목록 업데이트
  const onUpdateVouchers = async () => {
    if (have.groupId === '' || have.memberId === '') {
      dispatch(setVouchers([]));
      return;
    }

    try {
      const res = await request.call(api.getVoucherListMine, {
        permanent: 1,
        groupId: have.groupId,
        memberId: have.memberId
      });
      dispatch(setVouchers(res.vouchers));
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };
  useEffect(() => { onUpdateVouchers(); }, [have.groupId, have.memberId]);

  // 화면에 보여줄 포토카드 목록 업데이트
  const onUpdatePhotocards = async () => {
    if (want.groupId === '' || want.memberId === '') {
      dispatch(setPhotocards([]));
      return;
    }

    try {
      const res = await request.call(api.getPhotocardList, want.groupId, want.memberId);
      dispatch(setPhotocards(res.photocards));
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };
  useEffect(() => { onUpdatePhotocards(); }, [want.groupId, want.memberId]);

  // 그룹 선택 변경시 동작
  const onChangeGroupSelect = async (e) => {
    const name = e.target.name;
    const value = e.target.value;

    if (name === 'have') {
      dispatch(setHaveGroupId(value));
    } else if (name === 'want') {
      dispatch(setWantGroupId(value));
    }

    try {
      if (value === '') {
        dispatch(setMembers([]));
      } else if (value === 'all') {
        const res = await request.call(api.getAllMemberList);
        dispatch(setMembers(res.members));
      } else {
        const res = await request.call(api.getMemberList, value);
        dispatch(setMembers(res.members));
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response.data.message);
    }
  }

  // 멤버 선택 변경시 동작
  const onChangeMemberSelect = async (e) => {
    const name = e.target.name;
    const value = e.target.value;
    
    if (name === 'have') {
      dispatch(setHaveMemberId(value));
    } else if (name === 'want') {
      dispatch(setWantMemberId(value));
    }
  }

  // 사용할 소유권 선택시
  const onClickVoucher = (e) => {
    const target = e.currentTarget;
    const value = target.getAttribute('value');

    dispatch(setVoucherId(value));
  }

  // 받을 포토카드 선택시
  const onClickPhotocard = (e) => {
    const target = e.currentTarget;
    const value = target.getAttribute('value');

    dispatch(setPhotocardId(value));
  }

  // 탐색 버튼 클릭시
  const onClickExploreButton = async (e) => {
    e.preventDefault();
    try {
       const res = await request.call(api.getTradeExplore, voucherId, photocardId);
       dispatch(setTrades(res.trades));
       dispatch(setHaveVoucher(res.haveVoucher));
       console.log(res);
       if (res.trades.length > 0) {
        dispatch(setExploreMessage(`${res.trades.length}개의 교환글을 거쳐서 매칭되는 교환글을 찾았습니다!`));
       } else {
        dispatch(setExploreMessage("매칭 되는 교환글이 없습니다."));
       }
    } catch (err) {
      setMessage(err.response.data.message);
      dispatch(setExploreMessage(''));
    }
  }

  return (
    <UserTemplate
      className="TradeExplorePage"
      sidebar={<TradeSideBar />}
    >
      {request.loading ? <LoadingSpinner /> : null}
      <h1 className="title-label">포토카드 교환 탐색</h1>
      {message ? <MessageLabel>{message}</MessageLabel> : null}

      <p className="label">사용하려는 소유권</p>
      <section className="search_area">
        <article className="search">
          <p className="label">그룹</p>
          <Select name="have" value={have.groupId} onChange={onChangeGroupSelect}>
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
          <Select name="have" value={have.memberId} onChange={onChangeMemberSelect}>
            <option value="">선택</option>
            <option value="all">전체</option>
            {members ?
              members.map(member => 
                <option key={member.member_id} value={member.member_id}>{member.name}</option>
              ) : null}
          </Select>
        </article>
      </section>

      <section className="card_section">
        {vouchers ?
          vouchers.map(v =>
            <VoucherCard
              className={classNames({"active": v.voucher_id === parseInt(voucherId) })}
              key={v.voucher_id}
              value={v.voucher_id}
              name={v.name}
              albumName={v.album_name}
              src={`${BACKEND}/image/photocard/${v.image_name}`}
              onClick={onClickVoucher}
            />
          ) : null}
      </section>

      <p className="label">받으려는 포토카드</p>
      <section className="search_area">
        <article className="search">
          <p className="label">그룹</p>
          <Select name="want" value={want.groupId} onChange={onChangeGroupSelect}>
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
          <Select name="want" value={want.memberId} onChange={onChangeMemberSelect}>
            <option value="">선택</option>
            <option value="all">전체</option>
            {members ?
              members.map(member => 
                <option key={member.member_id} value={member.member_id}>{member.name}</option>
              ) : null}
          </Select>
        </article>
      </section>

      <section className="card_section">
        {photocards ?
          photocards.map(v =>
            <VoucherCard
              className={classNames({"active": v.photocard_id === parseInt(photocardId) })}
              key={v.photocard_id}
              value={v.photocard_id}
              name={v.name}
              albumName={v.album_name}
              src={`${BACKEND}/image/photocard/${v.image_name}`}
              onClick={onClickPhotocard}
            />
          ) : null}
      </section>

      <Button className="explore_button" onClick={onClickExploreButton}>매칭 가능한 교환이 있는지 탐색하기</Button>

      {exploreMessage &&
      <>
        <h1 className="title-label">탐색 결과</h1>
        <p className="label">{exploreMessage}</p>
        <TradeExploreList trades={trades} haveVoucher={haveVoucher} />
      </>}
    </UserTemplate>
  );
};

export default TradeExplorePage;