import React,{useState} from 'react';
import Button from '../components/form/Button';
import './ManagerLoginPage.scss';

const ManagerLoginPage = () => {

    return(
        <div className="ManagerLogin">
      <header>
        <h1>PokaPoka</h1>
      </header>
      <p className="title">관리자 로그인</p>

      <section className="Manager_section">
        <form>
          <p className="title-label">관리자 로그인</p>
        
          <input
            type="text"
            name="username"
            placeholder="아이디"
            autoComplete="off"
       
          />
          <input
            type="text"
            name="password"
            placeholder="비밀번호"
            autoComplete="off"
         
          />
          <Button className="login_btn" type="login">로그인</Button>
          </form>
          </section>

    </div>
    );
}
export default ManagerLoginPage;