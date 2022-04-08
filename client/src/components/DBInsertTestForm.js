import React, { useState } from 'react';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';
import './DBInsertTestForm.scss';

const DBInsertTestForm = () => {
  const [form, setForm] = useState({
    author: '',
    text: ''
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

  // 등록 버튼 누르면 백엔드 서버에 등록 요청
  const onClickAddButton = async () => {
    try {
      const res = await request.call(api.postTestDB, form.text, form.author); // 백엔드 서버에 요청
      console.log(res);
      setMessage(res.message); // 반환받은 메시지를 화면에 보여주기 위해 상태 업데이트
    } catch (err) {
      console.error(err); // 백엔드 서버로부터 오류 상태코드 반환받으면 출력
      setMessage(err.response.data.message);
    }
  }

  return (
    <div className="DBInsertTestForm">
      <div>작성자</div>
      <input type="text" name="author" value={form.author} onChange={onChangeInput} />
      <div>내용</div>
      <input type="text" name="text" value={form.text} onChange={onChangeInput} />
      <button type="button" onClick={onClickAddButton}>등록</button>
      {message ? <p className="message-label">{message}</p> : null}
      {request.loading ? <p>API 처리중...</p> : null}
    </div>
  );
};

export default DBInsertTestForm;