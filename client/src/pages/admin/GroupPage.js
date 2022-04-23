import React from 'react';
import { Link } from 'react-router-dom';
import { BACKEND } from '../../utils/api';
import AdminTemplate from '../../templates/AdminTemplate';
import Button from '../../components/form/Button';
import GroupCard from '../../components/card/GroupCard';
import './GroupPage.scss';

const GroupPage = () => {
  return (
    <AdminTemplate className="AdminGroupPage">
      <section className="title_area">
        <h1 className="title-label">아이돌 그룹 목록</h1>
        <Link to="/admin/group/writer">
          <Button className="add_btn">추가</Button>
        </Link>
      </section>
      <section className="card_section">

        <GroupCard src={`${BACKEND}/image/group/다미.jpg`} name="다미" />
        <GroupCard src={`${BACKEND}/image/group/포카포카.png`} name="포카포카" />
        <GroupCard src={`${BACKEND}/image/group/위베어베어스.jpg`} name="위베어베어스" />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />
        <GroupCard />

      </section>
    </AdminTemplate>
  );
};

export default GroupPage;