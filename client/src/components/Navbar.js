import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';
import AuthContext from '../contexts/Auth';
import './Navbar.scss';

const Navbar = () => {
  const URI = window.location.pathname;
  const { state: authState, actions: authActions } = useContext(AuthContext);
  const request = useRequest();
  const navigate = useNavigate();

  const onClickLogout = async () => {
    try {
      request.call(api.postLogout);
      authActions.logout();
      // 로그아웃할 때 리덕스 스토어에 저장된 상태를 모두 초기화하기 위해 navigate 기능을 사용하지 않았다.
      window.location.href = '/auth/login';

      // return navigate('/auth/login');
    } catch (err) {}
  }

  return (
    <nav className="Navbar">
      {authState.user.role === 'admin' ? 
      <Link className="nav-logo" to="/admin">PokaPoka</Link> : 
      <Link className="nav-logo" to="/main">PokaPoka</Link>}
      
      <section className="nav-items">
        {authState.user.username ?
        <>
          <section className="link_section">
            {authState.user.role === 'user' ?
            <>
              <Link
                className={classNames("nav-item link", {"active": URI.includes('/trade')})}
                to="/trade/all"
              >포토카드 교환</Link>
              <Link
                className={classNames("nav-item link", {"active": URI.includes('/stoarage')})}
                to="/stoarage/permanent"
              >포토카드 보관함</Link>
            </>
            : null}
          </section>
          <section className="user_section">
            {authState.user.role === 'user' &&
              <Link to="/mypage/userInfo">
                <img width="50px" height="50px" src="/user.png" alt="사용자" />
                <span className="nav-item">{authState.user.username}</span>
              </Link>
            }
            {authState.user.role === 'admin' &&
              <Link to="#">
                <img width="50px" height="50px" src="/admin.png" alt="관리자" />
                <span className="nav-item">{authState.user.username}</span>
              </Link>
            }
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
    </nav>
  );
};

export default Navbar;