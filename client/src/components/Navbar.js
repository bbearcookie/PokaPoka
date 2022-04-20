import React, { useContext } from 'react';
import './Navbar.scss';
import AuthContext from '../contexts/Auth';

const Navbar = () => {
  const { state: authState, actions: authActions } = useContext(AuthContext);

  return (
    <nav className="Navbar">
      <div className="nav-logo">PokaPoka</div>
      <section className="nav-items">
        <span className="nav-item">{authState.user.username}</span>
        <span className="nav-item">{authState.user.role}</span>
        <span className="nav-item">{authState.user.strategy}</span>
        <span className="nav-item">포토카드 보관함</span>
        <span className="nav-item">마이페이지</span>
        <span className="nav-item">로그아웃</span>
      </section>
    </nav>
  );
};

export default Navbar;