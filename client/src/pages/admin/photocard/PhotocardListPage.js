import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSelect, setGroups, setMembers, setPhotocards } from '../../../modules/photocardListPage';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { BACKEND } from '../../../utils/api';
import ImageCard from '../../../components/card/ImageCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import Button from '../../../components/form/Button';
import Select from '../../../components/form/Select';
import AdminTemplate from '../../../templates/AdminTemplate';
import './PhotocardListPage.scss';

const PhotocardListPage = () => {
  // 리덕스 스토어에 저장한 상태값. 페이지 이동시에도 상태를 보관해두기 위함.
  const { select, groups, members, photocards } = useSelector(state => ({
    select: state.photocardListPage.select,
    groups: state.photocardListPage.groups,
    members: state.photocardListPage.members,
    photocards: state.photocardListPage.photocards
  }));
  const dispatch = useDispatch(); // 리듀서 액션 함수를 작동시키는 함수
  const [message, setMessage] = useState('');
  const request = useRequest();

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

  // 화면에 보여줄 포토카드 목록 업데이트
  const onUpdatePhotocards = async (e) => {
    if (select.groupId === '' || select.memberId === '') {
      dispatch(setPhotocards([]));
      return;
    }

    try {
      const res = await request.call(api.getPhotocardList, select.groupId, select.memberId);
      dispatch(setPhotocards(res.photocards));
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };
  useEffect(() => { onUpdatePhotocards(); }, [select]);

  // 그룹 선택 변경시 동작
  const onChangeGroupSelect = async (e) => {
    dispatch(setSelect({ ...select, groupId: e.target.value }));

    if (e.target.value === '') {
      dispatch(setMembers([]));
    } else if (e.target.value === 'all') {
      try {
        const res = await request.call(api.getAllMemberList);
        dispatch(setMembers(res.members));
      } catch (err) {
        setMessage(err.response.data.message);
      }
    } else {
      try {
        const res = await request.call(api.getMemberList, e.target.value);
        dispatch(setMembers(res.members));
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
  }

  // 멤버 선택 변경시 동작
  const onChangeMemberSelect = async (e) => {
    dispatch(setSelect({ ...select, memberId: e.target.value}));
  }

  return (
    <AdminTemplate className="AdminPhotocardListPage">

      {request.loading ? <LoadingSpinner /> : null}
      {message ? <MessageLabel>{message}</MessageLabel> : null}

      <section className="title_area">
        <h1 className="title-label">포토카드 목록</h1>
        <Link to="/admin/photocard/writer">
          <Button className="add_button">추가</Button>
        </Link>
      </section>

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

      <section className="card_section">
        {photocards ?
          photocards.map(photocard =>
            <Link key={photocard.photocard_id} to={`/admin/photocard/detail/${photocard.photocard_id}`}>
              <ImageCard
                key={photocard.photocard_id}
                name={photocard.name}
                src={`${BACKEND}/image/photocard/${photocard.image_name}`}
              />
            </Link>
          ) : null}
      </section>

    </AdminTemplate>
  );
};

export default PhotocardListPage;