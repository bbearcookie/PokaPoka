import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import produce from 'immer';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import AdminTemplate from '../../templates/AdminTemplate';
import Input from '../../components/form/Input';
import Textarea from '../../components/form/Textarea';
import Button from '../../components/form/Button';
import './GroupWriterPage.scss';

const GroupWriterPage = () => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    gender: '',
    image: {
      file: '', // 업로드 된 실제 이미지 파일
      previewURL: '' // 브라우저에 임시로 보여줄 이미지 URL
    }
  });
  const [message, setMessage] = useState('');
  const imageRef = useRef(null);
  const request = useRequest();

  // input 값 변경시
  const onChangeInput = (e) => {
    setForm(produce(draft => {
      draft[e.target.name] = e.target.value;
    }));
  }

  // 이미지 업로드 초기화 클릭시
  const onClickImageReset = () => {
    imageRef.current.value = ''; // file 타입의 input 값 초기화
    setForm(produce(draft => {
      draft.image.file = ""; // 실제 이미지 파일 초기화
      draft.image.previewURL = ""; // 브라우저에 임시로 보여줄 이미지 URL 초기화
    }));
  }

  // 이미지 업로드 버튼 클릭시
  const onClickImageUpload = () => {
    imageRef.current.click(); // 숨겨져 있는 file 타입의 input 클릭 처리
  }

  // 이미지 파일 변경시
  const onChangeImage = (e) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];
    reader.onloadend = () => {
      setForm(produce(draft => {
        draft.image.file = file; // 실제 이미지 파일 설정
        draft.image.previewURL = reader.result; // 브라우저에 임시로 보여줄 이미지 URL 설정
      }));
    };
    reader.readAsDataURL(file);
  }

  // 작성 버튼 클릭시
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await request.call(api.postAdminGroup, form);
      setMessage(res.message);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }

  return (
    <AdminTemplate className="AdminGroupWriterPage">
      <form onSubmit={onSubmit}>
        <h1 className="title-label">아이돌 그룹 추가</h1>
        {message ? <p className="message-label">{message}</p> : null}
        <p className="label">그룹 이미지</p>
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
        <p className="label">이름</p>
        <Input
          type="text"
          name="name"
          value={form.name}
          autoComplete="off"
          placeholder="이름을 입력하세요"
          onChange={onChangeInput}
        />
        <p className="label">설명</p>
        <Textarea
          name="description"
          value={form.description}
          placeholder="설명을 입력하세요"
          onChange={onChangeInput}
        />
        <p className="label">성별</p>
        <section className="gender_section">
          <input id="mixed" type="radio" name="gender" value="m" onChange={onChangeInput} />
          <label htmlFor="mixed">혼성</label>
          <input id="boy" type="radio" name="gender" value="b" onChange={onChangeInput} />
          <label htmlFor="boy">남성</label>
          <input id="girl" type="radio" name="gender" value="g" onChange={onChangeInput} />
          <label htmlFor="girl">여성</label>
        </section>
        <section className="submit_section">
          <Link to="/admin/group"><Button className="cancel_button">취소</Button></Link>
          <Button className="submit_button" type="submit">작성</Button>
        </section>
      </form>
    </AdminTemplate>
  );
};

export default GroupWriterPage;