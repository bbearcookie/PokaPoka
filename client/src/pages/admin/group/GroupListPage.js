import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { BACKEND } from '../../../utils/api';
import AdminTemplate from '../../../templates/AdminTemplate';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/form/Button';
import ImageCard from '../../../components/card/ImageCard';
import './GroupListPage.scss';

// 그룹 목록 조회 페이지
const GroupListPage = () => {
  const request = useRequest();
  const [groups, setGroups] = useState([]);

  // 화면 로드시 작동
  const onLoad = async (e) => {
    try {
      const res = await request.call(api.getGroupList);
      setGroups(res.groups);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <AdminTemplate className="AdminGroupListPage">
      {request.loading ? <LoadingSpinner /> : null}
      <section className="title_area">
        <h1 className="title-label">아이돌 그룹 목록</h1>
        <Link to="/admin/group/writer">
          <Button className="add_button">추가</Button>
        </Link>
      </section>
      <section className="card_section">
        {groups ?
        groups.map(group =>
          <Link key={group.group_id} to={`/admin/group/detail/${group.group_id}`}>
            <ImageCard
              key={group.group_id}
              name={group.name}
              src={`${BACKEND}/image/group/${group.image_name}`}
            />
          </Link>
        ) : null}
      </section>
    </AdminTemplate>
  );
};

export default GroupListPage;