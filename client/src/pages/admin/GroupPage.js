import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import { BACKEND } from '../../utils/api';
import AdminTemplate from '../../templates/AdminTemplate';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/form/Button';
import GroupCard from '../../components/card/GroupCard';
import './GroupPage.scss';

const GroupPage = () => {
  const request = useRequest();
  const [groups, setGroups] = useState([]);

  // 화면 로드시 작동
  useEffect(() => {
    onLoad();
  }, []);
  const onLoad = async (e) => {
    try {
      const res = await request.call(api.getAdminGroupList);
      setGroups(res.groups);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AdminTemplate className="AdminGroupPage">
      {request.loading ? <LoadingSpinner /> : null}
      <section className="title_area">
        <h1 className="title-label">아이돌 그룹 목록</h1>
        <Link to="/admin/group/writer">
          <Button className="add_btn">추가</Button>
        </Link>
      </section>
      <section className="card_section">
        {groups ?
        groups.map(group =>
          <GroupCard
            key={group.group_id}
            name={group.name}
            src={`${BACKEND}/image/group/${group.image_name}`}
          />
        ) : null}
      </section>
    </AdminTemplate>
  );
};

export default GroupPage;