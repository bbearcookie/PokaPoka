import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import produce from 'immer';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import AdminTemplate from '../../../templates/AdminTemplate';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import Input from '../../../components/form/Input';
import Textarea from '../../../components/form/Textarea';
import Button from '../../../components/form/Button';
import './SuggestionWriterPage.scss';

// 문의사항 작성 페이지
const SuggestionWriterPage = () => {
  const { suggestionId } = useParams(); // URL에 포함된 suggestionId Params 정보
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [message, setMessage] = useState('');
  const categoryRefs = { // 문의사항 작성시 radio input을 checked 조작하기 위한 ref
    'normal': useRef(null),
    'shipping': useRef(null),
    'voucher': useRef(null),
    'contents': useRef(null),
    'trade': useRef(null)
  }
  const navigate = useNavigate();
  const request = useRequest();

  // 화면 로드시
  const onLoad = async (e) => {
    if (suggestionId) {
      try {
        const res = await request.call(api.getSuggestionDetail, suggestionId);
        setForm(produce(draft => {
          draft.title = res.suggestion.title;
          draft.content = res.suggestion.content;
          draft.category = res.suggestion.category;
        }));
        categoryRefs[res.suggestion.category].current.setAttribute('checked', 'on');
      } catch (err) {
        console.error(err);
      }
    }
  };
  useEffect(() => { onLoad(); }, []);

  // input 값 변경시
  const onChangeInput = (e) => {
    setForm(produce(draft => {
      draft[e.target.name] = e.target.value;
    }));
  }

  // 작성 취소 버튼 클릭시
  const onCancel = () => navigate(-1); // 뒤로 돌아가기

  // 작성 버튼 클릭시
  const onSubmit = async (e) => {
    e.preventDefault();

    // 새로 작성하는 경우
    if (!suggestionId) {
      try {
        const res = await request.call(api.postSuggestion, form);
        setMessage(res.message);
        return navigate('/admin/suggestion');
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
  }

  return (
    <AdminTemplate className="AdminGroupWriterPage">
      {request.loading ? <LoadingSpinner /> : null}
      <form onSubmit={onSubmit}>
        {suggestionId ?
        <h1 className="title-label">문의사항 작성</h1> :
        <h1 className="title-label">문의사항 작성</h1>}
        
        {message ? <MessageLabel>{message}</MessageLabel> : null}
        <p className="label">제목</p>
        <Input
          type="text"
          name="title"
          value={form.title}
          autoComplete="off"
          placeholder="제목을 입력하세요"
          onChange={onChangeInput}
        />
        <p className="label">내용</p>
        <Textarea
          name="content"
          value={form.content}
          placeholder="내용을 입력하세요"
          onChange={onChangeInput}
        />
        <p className="label">문의 타입</p>
        <section className="gender_section">
          <input id="normal" type="radio" name="category" value="normal" ref={categoryRefs.normal} onChange={onChangeInput} />
          <label htmlFor="normal">일반</label>
          <input id="shipping" type="radio" name="category" value="shipping" ref={categoryRefs.shipping} onChange={onChangeInput} />
          <label htmlFor="shipping">배송</label>
          <input id="voucher" type="radio" name="category" value="voucher" ref={categoryRefs.voucher} onChange={onChangeInput} />
          <label htmlFor="voucher">소유권</label>
          <input id="contents" type="radio" name="category" value="contents" ref={categoryRefs.contents} onChange={onChangeInput} />
          <label htmlFor="contents">새로운 데이터 추가</label>
          <input id="trade" type="radio" name="category" value="trade" ref={categoryRefs.trade} onChange={onChangeInput} /> 
          <label htmlFor="trade">거래</label>
        </section>
        <section className="submit_section">
          <Button className="cancel_button" type="button" onClick={onCancel}>취소</Button>
          <Button className="submit_button" type="submit">작성</Button>
        </section>
      </form>
    </AdminTemplate>
  );
};

export default SuggestionWriterPage;