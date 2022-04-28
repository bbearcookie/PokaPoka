import React, { useState } from 'react';
import Button from '../components/form/Button';
import './PwPage.scss';
const PwPage = () => {

    return(
        <div className="PwPage">
      <header>
        <h1>PokaPoka</h1>
      </header>
      <p className="title">비밀번호 찾기</p>
      <section className="PwPage_section">
        <form>
          <p className="title-label">비밀번호찾기</p>
        
          <p className="message">가입하실 때 사용하신 아이디, 이름, 전화번호를 입력해 주세요</p>
          <input
            type="text"
            name="username"
            placeholder="아이디"
            autoComplete="off"
       
          />

          <input
            type="text"
            name="name"
            placeholder="이름"
            autoComplete="off"
       
          />    
          <input
            type="number"
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
export default PwPage;