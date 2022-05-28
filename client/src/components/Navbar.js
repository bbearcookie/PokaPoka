import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRotate, faBriefcase, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
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

  if (authState.user.role) {
    if (authState.user.role === 'admin') {
      // 관리자에게 보여줄 네비바
      return (
        <nav className="Navbar">
          <Link className="nav-logo" to="/admin/user">PokaPoka</Link>
          <section className="nav-items">
            <section className="link_section"></section>
            <section className="user_section">
              <Link to="#">
                <img width="50px" height="50px" src="/admin.png" alt="관리자" />
                <span className="nav-item">{authState.user.username}</span>
              </Link>
              <span className="nav-item logout" onClick={onClickLogout}>로그아웃</span>
            </section>
          </section>
        </nav>
      );
    } else if (authState.user.role === 'user') {
      // 사용자에게 보여줄 네비바
      return (
        <nav className="Navbar">
          <Link className="nav-logo" to="/main">PokaPoka</Link>
          <section className="nav-items">
            <section className="link_section">
              <Link
                className={classNames("nav-item link", {"active": URI.includes('/trade')})}
                to="/trade/all"
              ><FontAwesomeIcon icon={faRotate} /><span>&nbsp;&nbsp;교환</span></Link>
              <Link
                className={classNames("nav-item link", {"active": URI.includes('/stoarage')})}
                to="/stoarage/permanent"
              ><FontAwesomeIcon icon={faBriefcase} /><span>&nbsp;&nbsp;보관함</span></Link>
              <Link
                className={classNames("nav-item link", {"active": URI.includes('/notice')})}
                to="/notice"
              ><FontAwesomeIcon icon={faInfoCircle} /><span>&nbsp;&nbsp;공지사항</span></Link>
            </section>
            <section className="user_section">
              <Link to="/mypage/userInfo">
                <img width="50px" height="50px" src="/user.png" alt="사용자" />
                <span className="nav-item username">{authState.user.username}</span>
              </Link>
              <span className="nav-item logout" onClick={onClickLogout}>로그아웃</span>
            </section>
          </section>
        </nav>
      );
    }
  } else {
    // 로그인 안한 사용자에게 보여줄 네비바
    return (
      <nav className="Navbar">
        <Link className="nav-logo" to="/main">PokaPoka</Link>
        <section className="nav-items">
          <section className="link_section"></section>
          <section className="user_section">
            <Link className="nav-item link" to="/auth/login">로그인</Link>
          </section>
        </section>
      </nav>
    )
  }
};

export default Navbar;