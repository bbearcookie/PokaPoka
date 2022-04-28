import React, { useState } from 'react';
import Button from '../components/form/Button';
import './UsernamePage.scss';

const UsernamePage = () =>{

  
    return(
    <div className="UsernamePage">
      <header>
        <h1>PokaPoka</h1>
      </header>
      <p className="title">아이디 찾기</p>

      <section className="username_section">
      <form>
          <p className="title-label">아이디찾기</p>
        
          <p className="message">가입하실 때 사용하신 이름과 전화번호를 입력해 주세요</p>
          <input
            type="text"
            name="name"
            placeholder="이름"
            autoComplete="off"
       
          />
          <input
            type="text"
            name="number"
            placeholder="전화번호"
            autoComplete="off"
         
          />
          <Button className="find_btn" type="find">찾기</Button>
          </form>
          </section>

    </div>
    );
}
export default UsernamePage;