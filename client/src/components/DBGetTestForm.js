import React, { useState } from 'react';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';
import DBData from './DBData';

const DBGetTestForm = () => {
  const [list, setList] = useState([]);
  const [message, setMessage] = useState('');
  const request = useRequest();

  // 가져오기 버튼 누르면 백엔드 서버에 등록된 정보들 조회 요청
  const onClickGetButton = async () => {
    try {
      const res = await request.call(api.getTestDB);
      setMessage(res.message);
      setList(res.list);
    } catch (err) {
      console.error(err);
      setMessage(err.response.data.message);
    }
  }
  
  return (
    <div className="DBGetTestForm">
      <button type="button" onClick={onClickGetButton}>가져오기</button>
      {message ? <p className="message-label">{message}</p> : null}
      {list && 
        list.map(data => <DBData key={data.id} author={data.author} text={data.text} />)
      }
    </div>
  );
};

export default DBGetTestForm;