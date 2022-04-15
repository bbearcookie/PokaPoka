import React, { useState } from 'react';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';
import IDDBData from './IDDBData';

const FindIDForm = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    verified: ''
  });
  const [message, setMessage] = useState('');
  const request = useRequest();
  const [list, setList] = useState([]);

  //인증 여부 확인 변수
  var verifiedCheck = false;
  
  // input 값 변경시 상태 변수값 업데이트
  const onChangeInput = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  // 인증 버튼을 누르면 전화 번호 인증
  const onClickCheckButton = async () => {
    try {
      console.log(form);
      const res = await request.call(api.postVerified, form.phone);
      setMessage(res.message);
    } catch (err) {
      console.error(err);
      setMessage(err.response.data.message);
    }
  }

  // 아이디 조회 버튼 누르면 전화번호 인증 후 백엔드 서버에 등록된 정보 요청
  const onClickFindButton = async () => {
    setList('');
    //전화 번호 인증여부 확인
    try {
      const res = await request.call(api.postVerifiedCheck, form.verified);
      setMessage(res.message);
      console.log(res);
      verifiedCheck = res.getitem('verified');
    } catch (err) {
      console.error(err);
      setMessage(err.response.data.message);
    }

    //아이디 조회
    if (verifiedCheck){
      try {
        console.log(form);
        const res = await request.call(api.getFindID, form.name, form.phone);
        setMessage(res.message);
        setList(res.list);
      } catch (err) {
        console.error(err);
        setMessage(err.response.data.message);
      }
    }
    else{
      setMessage("전화 번호 인증을 해주세요");
    }
    
  }

  return (
    <div className="FindIDForm">
      <div>이름</div>
      <input type="text" name="name" value={form.name} onChange={onChangeInput} />
      <div>전화 번호</div>
      <input type="text" name="phone" value={form.phon} onChange={onChangeInput} />
      <button type="button" onClick={onClickCheckButton}>인증</button>
      <div>인증 번호</div>
      <input type="text" name="verified" value={form.verified} onChange={onChangeInput} />

      <button type="button" onClick={onClickFindButton}>아이디 조회</button>
      {message ? <p className="message-label">{message}</p> : null}
      {request.loading ? <p>API 처리중...</p> : null}
      {list && 
        list.map(data => <IDDBData key={data.username} username={data.username}/>)
      }
    </div>
  );
};

export default FindIDForm;