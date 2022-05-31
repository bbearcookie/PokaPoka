import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import produce from 'immer';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import UserTemplate from '../../templates/UserTemplate';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import LoadingSpinner from '../../components/LoadingSpinner';
import MessageLabel from '../../components/MessageLabel';
import Input from '../../components/form/Input';
import Textarea from '../../components/form/Textarea';
import Button from '../../components/form/Button';
import './SuggestionWriterPage.scss';

// 문의사항 작성 페이지
const SuggestionWriterPage = () => {
  const { suggestionId } = useParams(); // URL에 포함된 suggestionId Params 정보
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: '',
    image: {
      file: '', // 업로드 된 실제 이미지 파일
      previewURL: '', // 브라우저에 임시로 보여줄 이미지 URL
      initialURL: '', // 브라우저에 보여줄 초기 이미지 URL. 작성시에는 빈 값이고 수정시에는 원래 있는 이미지가 된다.
    }
  });
  const [message, setMessage] = useState('');
  const categoryRefs = { // 문의사항 작성시 radio input을 checked 조작하기 위한 ref
    'normal': useRef(null),
    'shipping': useRef(null),
    'voucher': useRef(null),
    'contents': useRef(null),
    'trade': useRef(null)
  }
  const imageRef = useRef(null);
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

  // 이미지 파일 변경시
  const onChangeImage = (e) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];

    if (file) {
      reader.onloadend = () => {
        setForm(produce(draft => {
          draft.image.file = file; // 실제 이미지 파일 설정
          draft.image.previewURL = reader.result; // 브라우저에 임시로 보여줄 이미지 URL 설정
        }));
      };
      reader.readAsDataURL(file);
    }
  }

  // 이미지 업로드 초기화 클릭시
  const onClickImageReset = () => {
    imageRef.current.value = ''; // file 타입의 input 값 초기화
    setForm(produce(draft => {
      draft.image.file = ""; // 실제 이미지 파일 초기화
      draft.image.previewURL = form.image.initialURL; // 브라우저에 임시로 보여줄 이미지 URL 초기화
    }));
  }

  // 이미지 업로드 버튼 클릭시
  const onClickImageUpload = () => {
    imageRef.current.click(); // 숨겨져 있는 file 타입의 input 클릭 처리
  }

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
        return navigate('/mypage/suggestion');
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
  }

  return (
    <UserTemplate className="SuggestionWriterPage" sidebar={<MyPageSidebar />}>
      {request.loading ? <LoadingSpinner /> : null}
      <form onSubmit={onSubmit}>
        {suggestionId ?
        <h1 className="title-label">문의사항 작성</h1> :
        <h1 className="title-label">문의사항 작성</h1>}
        
        {message ? <MessageLabel>{message}</MessageLabel> : null}

        <p className="label">이미지</p>
        <section className="image_section">
          <img 
            width="200px"
            height="200px"
            src={form.image['previewURL']}
            onError={e => e.target.src = '/no_image.jpg'}
            alt="그룹"
          />
          <input type="file" accept=".jpg, .png" ref={imageRef} onChange={onChangeImage} />
          <section className="button_section">
            <Button className="cancel_button" onClick={onClickImageReset}>초기화</Button>
            <Button className="submit_button" onClick={onClickImageUpload}>업로드</Button>
          </section>
        </section>

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
          <label htmlFor="normal">기타</label>
          <input id="shipping" type="radio" name="category" value="shipping" ref={categoryRefs.shipping} onChange={onChangeInput} />
          <label htmlFor="shipping">배송</label>
          <input id="voucher" type="radio" name="category" value="voucher" ref={categoryRefs.voucher} onChange={onChangeInput} />
          <label htmlFor="voucher">소유권</label>
          <input id="contents" type="radio" name="category" value="contents" ref={categoryRefs.contents} onChange={onChangeInput} />
          <label htmlFor="contents">제보</label>
          <input id="trade" type="radio" name="category" value="trade" ref={categoryRefs.trade} onChange={onChangeInput} /> 
          <label htmlFor="trade">거래</label>
        </section>
        <section className="submit_section">
          <Button className="cancel_button" type="button" onClick={onCancel}>취소</Button>
          <Button className="submit_button" type="submit">작성</Button>
        </section>
      </form>
    </UserTemplate>
  );
};

export default SuggestionWriterPage;