import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
      <section className="nav-items">
        {authState.user ?
        <>
          <section className="link_section">
            {authState.user.role === 'user' ?
            <>
              <Link className="nav-item link" to="#">포토카드 탐색</Link>
              <Link className="nav-item link" to="#">포토카드 교환</Link>
              <Link className="nav-item link" to="#">포토카드 보관함</Link>
            </>
            : null}
            </section>
            <section className="user_section">
            {authState.user.role === 'user' ?
              <img width="50px" height="50px" src="/user.png" alt="사용자" /> : null}
            {authState.user.role === 'admin' ?
              <img width="50px" height="50px" src="/admin.png" alt="관리자" /> : null}

            <span className="nav-item">{authState.user.username}</span>
            <span className="nav-item logout" onClick={onClickLogout}>로그아웃</span>
          </section>
        </> :
        <>
          <section className="link_section"></section>
          <section className="user_section">
            <Link className="nav-item link" to="/auth/login">로그인</Link>
          </section>
        </>}



      </section>




      {/* {authState.user ?
      <section className="nav-items">
        <section className="link_section">
          {authState.user.role === 'user' ?
          <>
            <Link className="nav-item link" to="#">포토카드 탐색</Link>
            <Link className="nav-item link" to="#">포토카드 교환</Link>
            <Link className="nav-item link" to="#">포토카드 보관함</Link>
          </>
          : null}
        </section>
        <section className="user_section">
          {authState.user.role === 'user' ?
            <img width="50px" height="50px" src="/user.png" alt="사용자" /> : null}
          {authState.user.role === 'admin' ?
            <img width="50px" height="50px" src="/admin.png" alt="관리자" /> : null}
          
          <span className="nav-item">{authState.user.username}</span>
          <span className="nav-item logout" onClick={onClickLogout}>로그아웃</span>
        </section>
      </section>
      : null} */}


    </nav>
  );
};

export default Navbar;