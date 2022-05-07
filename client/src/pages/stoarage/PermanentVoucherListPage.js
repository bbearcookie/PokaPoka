import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import { BACKEND } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/form/Button';
import MessageLabel from '../../components/MessageLabel';
import Select from '../../components/form/Select';
import PhotoStoarageSidebar from '../../components/sidebar/PhotoStoarageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import './PermanentVoucherListPage.scss';

const PermanentVoucherListPage = () => {
  const [vouchers, setVouchers] = useState([]);
  const [select, setSelect] = useState({
    groupId: '',
    memberId: ''
  });
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState('');
  const request = useRequest();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.getGroupList);
      setGroups(res.groups);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  // 화면에 보여줄 소유권 목록 업데이트
  const onUpdateVouchers = async (e) => {
    try {
      const res = await request.call(api.getVoucherListMine, select.groupId, select.memberId, 1);
      setVouchers(res.vouchers);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };
  useEffect(() => { onUpdateVouchers(); }, [select]);

  console.log(vouchers);

  // 그룹 선택 변경시 동작
  const onChangeGroupSelect = async (e) => {
    setSelect({ ...select, groupId: e.target.value });

    if (e.target.value === '') {
      setMembers([]);
    } else if (e.target.value === 'all') {
      try {
        const res = await request.call(api.getAllMemberList);
        setMembers(res.members);
      } catch (err) {
        setMessage(err.response.data.message);
      }
    } else {
      try {
        const res = await request.call(api.getMemberList, e.target.value);
        setMembers(res.members);
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
  }

  // 멤버 선택 변경시 동작
  const onChangeMemberSelect = async (e) => {
    setSelect({ ...select, memberId: e.target.value});
  }

  return (
    <UserTemplate
      className="PermanentVoucherListPage"
      sidebar={<PhotoStoarageSidebar />}
    >
      {request.loading ? <LoadingSpinner /> : null}
      {message ? <MessageLabel>{message}</MessageLabel> : null}

      <h1 className="title-label">보유한 정식 소유권</h1>
      <section className="search_area">
        <article className="search">
          <p className="label">그룹</p>
          <Select name="group" value={select.groupId} onChange={onChangeGroupSelect}>
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
          <Select name="member" value={select.memberId} onChange={onChangeMemberSelect}>
            <option value="">선택</option>
            {select.groupId ? <option value="all">전체</option> : null}
            {members ?
            members.map(member =>
              <option key={member.member_id} value={member.member_id}>{member.name}</option>
            ) : null}
          </Select>
        </article>
      </section>
    </UserTemplate>
  );
};

export default PermanentVoucherListPage;