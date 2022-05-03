import React, { useState } from 'react';
import Button from '../../components/form/Button';
import './PwChangePage.scss';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import { useNavigate } from "react-router-dom";

const PwChangePage = () => {
  const navigate = useNavigate();

    const [form, setForm] = useState({
        password: '',
        password_check: ''
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

    const onChangeButton = async () => {
      try {
        const res = await request.call(api.postPassword, form.password, form.password_check);
        setMessage(res.message);
        if(res.message === "비밀 번호를 변경했습니다.") setTimeout(() => {  return navigate('/auth/login'); }, 2000);
      } catch (err) {
        console.error(err);
        setMessage(err.response.data.message);
      }
    }
    
    return(
        <div className="PwChangePage">
        <header>
        <h1>PokaPoka</h1>
      </header>
      <section className="PwChange_section">
      <form>
          <p className="title-label">비밀번호변경</p>
        
          {message ? <p className="message-label">{message}</p> : null}
          <input
            type="password"
            name="password"
            placeholder="새 비밀번호"
            autoComplete="off"
            value={form.password} 
            onChange={onChangeInput}
       
          />

          <input
            type="password"
            name="password_check"
            placeholder="새 비밀번호 확인"
            autoComplete="off"
            value={form.password_check} 
            onChange={onChangeInput}
       
          />    
          
          <Button className="find_btn" onClick={onChangeButton}>변경</Button>
          </form>
          </section>
      
        </div>
    );
}
export default PwChangePage;