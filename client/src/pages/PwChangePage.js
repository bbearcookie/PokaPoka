import React, { useState } from 'react';
import Button from '../components/form/Button';
import './PwChangePage.scss';

const PwChangePage = () => {
    
    return(
        <div className="PwChangePage">
        <header>
        <h1>PokaPoka</h1>
      </header>
      <p className="title">비밀번호 변경</p>
      <section className="PwChange_section">
      <form>
          <p className="title-label">비밀번호변경</p>
        
          <p className="message">새롭게 사용하실 비밀번호를 입력해 주세요</p>
          <input
            type="text"
            name="password"
            placeholder="새 비밀번호"
            autoComplete="off"
       
          />

          <input
            type="text"
            name="password_check"
            placeholder="새 비밀번호 확인"
            autoComplete="off"
       
          />    
          
          <Button className="find_btn" type="find">찾기</Button>
          </form>
          </section>
      
        </div>
    );
}
export default PwChangePage;