import React,{useState} from 'react';
import './SignupCompletePage.scss';

const SignupCompletePage  = () => {
    return(
        <div className="SignupCompletePage">
            <header>
            <h1>PokaPoka</h1>
            </header>
            <p className="title-label">회원가입 완료</p>
            <section className="Signup_section">
            <form>
            <p className="title-label">회원가입이 완료되었습니다.</p>
            <p className="message">로그인을 진행해 주세요</p>
          <button className="go_btn">로그인 하러 가기</button>
        </form>
        </section>
        </div>
    );
}
export default SignupCompletePage;