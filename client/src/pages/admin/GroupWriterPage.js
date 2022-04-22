import React from 'react';
import AdminTemplate from '../../templates/AdminTemplate';
import Input from '../../components/form/Input';
import Textarea from '../../components/form/Textarea';
import Button from '../../components/form/Button';
import './GroupWriterPage.scss';

const GroupWriterPage = () => {
  return (
    <AdminTemplate className="AdminGroupWriterPage">
      <h1 className="title-label">아이돌 그룹 추가</h1>
      <p className="label">그룹 이미지</p>
      <section className="image_section">
        <img 
          width="200px"
          height="200px"
          src="/logo512.png"
          alt="그룹"
        />
        <section className="button_section">
          <Button className="cancel_button">초기화</Button>
          <Button className="submit_button">업로드</Button>
        </section>
      </section>
      <p className="label">이름</p>
      <Input
        placeholder="이름을 입력하세요"
      />
      <p className="label">설명</p>
      <Textarea
        placeholder="설명을 입력하세요"
      />
      <p className="label">성별</p>
      <section className="gender_section">
        <input id="mixed" type="radio" name="gender" value="mixed"></input>
        <label for="mixed">혼성</label>
        <input id="boy" type="radio" name="gender" value="boy"></input>
        <label for="boy">남성</label>
        <input id="girl" type="radio" name="gender" value="girl"></input>
        <label for="girl">여성</label>
      </section>
      <section className="submit_section">
        <Button className="cancel_button">취소</Button>
        <Button className="submit_button">작성</Button>
      </section>
    </AdminTemplate>
  );
};

export default GroupWriterPage;