import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import qs from 'qs';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';
import AuthContext from '../contexts/Auth';
import Input from '../components/form/Input';
import Button from '../components/form/Button';
import Navbar from '../components/Navbar';
import Kakao from '../assets/Kakao';
import Naver from '../assets/Naver';
import './LoginPage.scss';

// 카카오 로그인 요청 URL
const kakaoURL = `https://kauth.kakao.com/oauth/authorize?` + 
`client_id=${process.env.REACT_APP_KAKAO_REST_API_KEY}&` +
`redirect_uri=${process.env.REACT_APP_KAKAO_LOGIN_REDIRECT_URI}&` +
`response_type=code`;

// 네이버 로그인 요청 URL
const naverURL = `https://nid.naver.com/oauth2.0/authorize?` +
`client_id=${process.env.REACT_APP_NAVER_LOGIN_CLIENT_ID}&` +
`redirect_uri=${process.env.REACT_APP_NAVER_LOGIN_REDIRECT_URI}&` +
`state=STATE_STRING&` +
`response_type=code`;

// 로그인 페이지 컴포넌트
const LoginPage = () => {
  const { state: authState, actions: authActions } = useContext(AuthContext);
  const query = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  const request = useRequest();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: ''
  });
  const [message, setMessage] = useState(query.message);

  // input 값 변경시 상태 업데이트
  const onChangeInput = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  // 로그인 버튼 클릭시 API 요청
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await request.call(api.postLogin, form);
      console.log(res);
      authActions.login(res);
      setMessage(res.message);

      // 관리자가 로그인 시 관리자 페이지로 리디렉션
      if (res.role === 'admin') return navigate('/admin');
    } catch (err) {
      console.error(err);
      setMessage(err.response.data.message);
    }
  }
 
  return (
    <div className="LoginPage">
      <header>
        <h1>PokaPoka</h1>
      </header>

      <section className="login_section">
        <form onSubmit={onSubmit}>
          <p className="title-label">로그인</p>
          {message ? <p className="message-label">{message}</p> : null}

          <Input
            type="text"
            name="username"
            placeholder="아이디"
            autoComplete="off"
            value={form.username}
            onChange={onChangeInput}
          />
          <Input
            type="password"
            name="password"
            placeholder="비밀번호"
            autoComplete="off"
            value={form.password}
            onChange={onChangeInput}
          />
          <Button className="submit_btn" type="submit">로그인</Button>

          <section className="social_login_section">
            <a href={naverURL}>
              <Button className="naver_btn">
                <Naver fill="white" />
                <span>네이버 로그인</span>
              </Button>
            </a>
            <a href={kakaoURL}>
              <Button className="kakao_btn">
                <Kakao />
                <span>카카오 로그인</span>
              </Button>
            </a>
          </section>

          <section className="bottom_section">
            <Link to="/finding/username">아이디 찾기</Link> <span> | </span>
            <Link to="/finding/password">비밀번호 찾기</Link> <span> | </span>
            <Link to="/auth/signup">회원가입</Link>
          </section>
        </form>
      </section>

      <Navbar />

    </div>
  );
}

export default LoginPage;