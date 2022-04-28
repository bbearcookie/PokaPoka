import React, { useState } from 'react';
import Button from '../components/form/Button';
import './PwPage.scss';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';
import { useNavigate } from "react-router-dom";

const PwPage = () => {
  const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '',
        name: '',
        phone: ''
    });
    const [message, setMessage] = useState('');
    const request = useRequest();
      
    // input 값 변경시 상태 변수값 업데이트
    const onChangeInput = (e) => {
        setForm({
          ...form,
          [e.target.name]: e.target.value
        });
    };

    const onFindButton = async () => {
      try {
        const res = await request.call(api.postIdCheck, form.username, form.name, form.phone);
        setMessage(res.message);
        if(res.message === "해당 회원이 존재합니다. 전화번호 인증 페이지로 이동.") setTimeout(() => {  return navigate('/finding/sms'); }, 2000);
      } catch (err) {
        console.error(err);
        setMessage(err.response.data.message);
      }
    }

    return(
        <div className="PwPage">
      <header>
        <h1>PokaPoka</h1>
      </header>
      <p className="title">비밀번호 찾기</p>
      <section className="PwPage_section">
        <form>
          <p className="title-label">비밀번호찾기</p>
        
          {message ? <p className="message-label">{message}</p> : null}
          <input
            type="text"
            name="username"
            placeholder="아이디"
            autoComplete="off"
            value={form.username} 
            onChange={onChangeInput}
       
          />

          <input
            type="text"
            name="name"
            placeholder="이름"
            autoComplete="off"
            value={form.name} 
            onChange={onChangeInput}
       
          />    
          <input
            type="text"
            name="phone"
            placeholder="전화번호"
            autoComplete="off"
            value={form.phon} 
            onChange={onChangeInput}
         
          />
          <Button className="find_btn" onClick={onFindButton} >찾기</Button>
          </form>
          </section>
        </div>
    );
}
export default PwPage;