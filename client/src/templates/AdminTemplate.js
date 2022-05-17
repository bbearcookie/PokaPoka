import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { STORAGE_KEY_NAME } from '../contexts/Auth';
import Navbar from '../components/Navbar';
import AdminSidebar from '../components/sidebar/AdminSidebar';
import './AdminTemplate.scss';

const AdminTemplate = ({ className, children }) => {
  const navigate = useNavigate();

  // 관리자가 아니면 페이지 접근 불가능하도록 함.
  useEffect(() => {
    let user = localStorage.getItem(STORAGE_KEY_NAME); // 로컬 스토리지의 사용자 정보 가져옴
    if (!user) return navigate('/auth/login'); // 로그인 안된 상태면 접근 불가
    user = JSON.parse(user);
    if (user.role !== 'admin') return navigate('/auth/login'); // 관리자 아닌 상태면 접근 불가
  }, []);

  return (
    <div className="AdminTemplate">
      <Navbar />
      <section className="middle_section">
        <AdminSidebar />
        <section className={classNames("content_section", className)}>
          {children}
        </section>
      </section>
    </div>
  );
};

export default AdminTemplate;