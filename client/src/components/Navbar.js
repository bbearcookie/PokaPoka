import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/Auth';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';
import './Navbar.scss';

const Navbar = () => {
  const { state: authState, actions: authActions } = useContext(AuthContext);
  const request = useRequest();
  const navigate = useNavigate();

  const onClickLogout = async () => {
    try {
      request.call(api.postLogout);
      authActions.logout();
      return navigate('/auth/login');
    } catch (err) {}
  }

  return (
    <nav className="Navbar">
      <div className="nav-logo">PokaPoka</div>
      {authState.user ?
      <section className="nav-items">
        <span className="nav-item">{authState.user.username}</span>
        <span className="nav-item">{authState.user.role}</span>
        <span className="nav-item">{authState.user.strategy}</span>
        {authState.user.role === 'user' ?
        <>
          <span className="nav-item">포토카드 보관함</span>
          <span className="nav-item">마이페이지</span>
        </>
        : null}
        <span className="nav-item logout" onClick={onClickLogout}>로그아웃</span>
      </section>
      : null}
    </nav>
  );
};

export default Navbar;