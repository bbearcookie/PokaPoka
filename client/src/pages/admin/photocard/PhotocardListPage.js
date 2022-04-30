import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { BACKEND } from '../../../utils/api';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import Button from '../../../components/form/Button';
import Select from '../../../components/form/Select';
import AdminTemplate from '../../../templates/AdminTemplate';
import './PhotocardListPage.scss';

const PhotocardListPage = () => {
  const request = useRequest();
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [photocards, setPhotocards] = useState([]);
  const [message, setMessage] = useState('');

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.getAdminGroupList);
      setGroups(res.groups);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }
  useEffect(() => { onLoad(); }, []);

  // 그룹 선택 변경시 동작
  const onChangeGroupSelect = async (e) => {
    if (e.target.value === 'none') {
      setMembers([]);
    } else if (e.target.value === 'all') {
      try {
        const res = await request.call(api.getAdminAllMemberList);
        setMembers(res.members);
        console.log(res);
      } catch (err) {
        setMessage(err.response.data.message);
      }
    } else {
      try {
        const res = await request.call(api.getAdminMemberList, e.target.value);
        setMembers(res.members);
        console.log(res);
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
  }

  // 멤버 선택 변경시 동작
  const onChangeMemberSelect = async (e) => {
    console.log(e.target.value);

    if (e.target.value === 'none') {

    } else if (e.target.value === 'all') {

    } else {

    }
  }

  return (
    <AdminTemplate className="AdminPhotocardListPage">
      {request.loading ? <LoadingSpinner /> : null}
      {message ? <MessageLabel>{message}</MessageLabel> : null}
      <section className="title_area">
        <h1 className="title-label">포토카드 목록</h1>
        <Link to="#">
          <Button className="add_button">추가</Button>
        </Link>
      </section>
      <section className="search_area">
        <article className="search">
          <p className="label">그룹</p>
          <Select name="group" onChange={onChangeGroupSelect}>
            <option value="none">선택</option>
            <option value="all">전체</option>
            {groups ?
            groups.map(group =>
              <option key={group.group_id} value={group.group_id}>{group.name}</option>
            ) : null}
          </Select>
        </article>
        <article className="search">
          <p className="label">멤버</p>
          <Select name="member" onChange={onChangeMemberSelect}>
            <option value="none">선택</option>
            <option value="all">전체</option>
            {members ?
            members.map(member =>
              <option key={member.member_id} value={member.member_id}>{member.name}</option>
            ) : null}
          </Select>
        </article>
      </section>
    </AdminTemplate>
  );
};

export default PhotocardListPage;