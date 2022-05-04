import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/form/Button';
import './UsernamePage.scss';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';

const UsernamePage = () =>{
    const [form, setForm] = useState({
        name: '',
        phone: ''
    });
    const [message, setMessage] = useState('');
    const request = useRequest();
    const navigate = useNavigate();
      
    // input 값 변경시 상태 변수값 업데이트
    const onChangeInput = (e) => {
        setForm({
          ...form,
          [e.target.name]: e.target.value
        });
    };

    const onFindButton = async () => {
      try {
        const res = await request.call(api.getUsername, form.name, form.phone);
        setMessage(res.message);
        if(res.message === "DB를 조회했습니다.") setMessage("아이디: " + res.list[0].username);
      } catch (err) {
        console.error(err);
        setMessage(err.response.data.message);
      }
    }

    // 뒤로가기 버튼 클릭시
    const onClickBackButton = () => {
      return navigate(-1);
    }
  
    return(
    <div className="UsernamePage">
      <header>
        <h1>PokaPoka</h1>
      </header>

      <section className="username_section">
      <form>
          <p className="title-label">아이디찾기</p>
        
          {message ? <p className="message-label">{message}</p> : null}
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
            value={form.phone} 
            onChange={onChangeInput}
         
          />
          <Button className="find_btn" onClick={onFindButton}>찾기</Button>
          <Button className="cancel_button" onClick={onClickBackButton}>뒤로가기</Button>
          </form>
          </section>

    </div>
    );
}
export default UsernamePage;