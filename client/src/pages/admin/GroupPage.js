import React from 'react';
import { Link } from 'react-router-dom';
import AdminTemplate from '../../templates/AdminTemplate';
import Button from '../../components/form/Button';
import './GroupPage.scss';

const GroupPage = () => {
  return (
    <AdminTemplate className="AdminGroupPage">
    <p>그룹 관리 페이지</p>
    <Link to="/admin/group/writer"><Button>추가</Button></Link>
    </AdminTemplate>
  );
};

export default GroupPage;