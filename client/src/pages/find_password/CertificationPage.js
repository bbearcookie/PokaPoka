import React, { useState } from 'react';
import Button from '../../components/form/Button';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import './CertificationPage.scss';
import { useNavigate } from "react-router-dom";

const CertificationPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        phone: '',
        cert_num: ''
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
    
    const onClickRequestBtn = async () => {
      try {
        const res = await request.call(api.postSending, form.phone);
        console.log(res);
        setMessage(res.message);
      } catch (err) {
        console.error(err);
        setMessage(err.response.data.message);
      }
    }

    const onClickCertBtn = async () => {
        try {
            const res = await request.call(api.postConfirmation, form.cert_num);
            setMessage(res.message);
            console.log(res.message);
            if(res.message === "이미 인증번호가 인증 되었습니다." || res.message === "인증되었습니다.") 
              setTimeout(() => {return navigate('/finding/pwchange'); }, 2000); 
        } catch (err) {
          console.error(err);
          setMessage(err.response.data.message);
        }
    }
  
    return(
        <div className="certification">
        <header>
            <h1>PokaPoka</h1>
        </header>
        <section className="certification">
            <form>
            <p className="title-label">전화번호 인증</p>
            
            {message ? <p className="message-label">{message}</p> : null}

            <input
                type="text"
                name="phone"
                placeholder="전화번호"
                autoComplete="off"
                value={form.phone} 
                onChange={onChangeInput}
            />
            <Button className="send_btn" onClick={onClickRequestBtn}>인증 번호 요청</Button>    
            
            <input
                type="text"
                name="cert_num"
                placeholder="인증번호"
                autoComplete="off"
                value={form.cert_num} 
                onChange={onChangeInput}
            />
            <Button className="cert_btn" onClick={onClickCertBtn}>인증</Button>
            </form>
            </section>
            </div>
    );
}
export default CertificationPage;