import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { STORAGE_KEY_NAME } from '../contexts/Auth';
import Navbar from '../components/Navbar';
import './AdminTemplate.scss';

const AdminTemplate = ({className, children}) => {
  const navigate = useNavigate();

  // 관리자가 아니면 페이지 접근 불가능하도록 함.
  useEffect(() => {
    let user = sessionStorage.getItem(STORAGE_KEY_NAME); // 세션 스토리지의 사용자 정보 가져옴
    if (!user) return navigate('/auth/login'); // 로그인 안된 상태면 접근 불가
    user = JSON.parse(user);
    if (user.role !== 'admin') return navigate('/auth/login'); // 관리자 아닌 상태면 접근 불가
  }, []);

  return (
    <div className="AdminTemplate">
      <Navbar />
      <section className="middle_section">
        <article className="sidebar">
          <ul className="nav_category">
            <li className="title-item"><NavLink to="/admin">사용자 관리</NavLink></li>
          </ul>
          <ul className="nav_category">
            <li className="title-item"><NavLink to="/admin/test1">커뮤니티 관리</NavLink></li>
            <li className="link-item"><NavLink to="/admin/test1">문의사항</NavLink></li>
            <li className="link-item"><NavLink to="/admin/test1">공지사항</NavLink></li>
          </ul>
          <ul className="nav_category">
            <li className="title-item"><NavLink to="/admin/test1">포토카드 관리</NavLink></li>
            <li className="link-item"><NavLink to="/admin/test1">교환글</NavLink></li>
            <li className="link-item"><NavLink to="/admin/test1">소유권</NavLink></li>
            <li className="link-item"><NavLink to="/admin/test1">배송</NavLink></li>
          </ul>
          <ul className="nav_category">
            <li className="title-item"><NavLink to="/admin/group">데이터 관리</NavLink></li>
            <li className="link-item"><NavLink to="/admin/group">그룹 관리</NavLink></li>
            <li className="link-item"><NavLink to="/admin/test1">멤버 관리</NavLink></li>
            <li className="link-item"><NavLink to="/admin/test1">앨범 관리</NavLink></li>
            <li className="link-item"><NavLink to="/admin/test1">포토카드 관리</NavLink></li>
          </ul>
        </article>
        <section className={className}>
          {children}
        </section>
      </section>
    </div>
  );
};

export default AdminTemplate;