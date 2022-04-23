import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/form/Button';
import AdminTemplate from '../../templates/AdminTemplate';
import './GroupDetailPage.scss';

const GroupDetailPage = () => {
  return (
    <AdminTemplate className="AdminGroupDetailPage">
    <h1 className="title-label">아이돌 그룹 상세 정보</h1>
      <section className="label_area">
        <p className="label">이미지</p>
        <img 
            width="200px"
            height="200px"
            src={'ha'}
            onError={e => e.target.src = '/no_image.jpg'}
            alt="그룹"
        />
      </section>
      <section className="label_area">
        <p className="label">이름</p>
        <p>베어베어스</p>
      </section>
      <section className="label_area">
        <p className="label">설명</p>
        <p>~~~~년도에 데뷔를 했으며 ~~~ 활동을 했다 ...</p>
      </section>
      <section className="label_area">
        <p className="label">성별</p>
        <p>보이그룹</p>
      </section>
      <section className="label_area">
        <p className="label">멤버</p>
        <p>그리즐리</p>
        <p>판다</p>
        <p>아이스베어</p>
      </section>
      <section className="submit_section">
        <Link to="/admin/group"><Button className="cancel_button">뒤로 가기</Button></Link>
        <Button className="edit_button">수정</Button>
        <Button className="remove_button">삭제</Button>
      </section>
    </AdminTemplate>
  );
};

export default GroupDetailPage;