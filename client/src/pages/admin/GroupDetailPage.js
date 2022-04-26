import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import { BACKEND } from '../../utils/api';
import Button from '../../components/form/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import AdminTemplate from '../../templates/AdminTemplate';
import './GroupDetailPage.scss';

// 성별 속성에 따라 화면에 보여줄 텍스트
const gender = {
  'm': '혼성',
  'g': '걸그룹',
  'b': '보이그룹'
}

// 그룹 상세 조회 페이지
const GroupDetailPage = () => {
  const { groupId } = useParams(); // URL에 포함된 groupId Params 정보
  const [group, setGroup] = useState({
    name: '',
    description: '',
    gender: '',
    image_name: ''
  });
  const request = useRequest();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.getAdminGroupDetail, groupId);
      setGroup({
        name: res.group.name,
        description: res.group.description,
        gender: res.group.gender,
        image_name: res.group.image_name
      });
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <AdminTemplate className="AdminGroupDetailPage">
      {request.loading ? <LoadingSpinner /> : null}
      <h1 className="title-label">아이돌 그룹 상세 정보</h1>
      <section className="label_area">
        <p className="label">이미지</p>
        <img 
            width="200px"
            height="200px"
            src={`${BACKEND}/image/group/${group.image_name}`}
            onError={e => e.target.src = '/no_image.jpg'}
            alt="그룹"
        />
      </section>
      <section className="label_area">
        <p className="label">이름</p>
        <p>{group.name}</p>
      </section>
      <section className="label_area">
        <p className="label">설명</p>
        <p>{group.description}</p>
      </section>
      <section className="label_area">
        <p className="label">성별</p>
        <p>{gender[group.gender]}</p>
      </section>
      <section className="submit_section">
        <Link to="/admin/group"><Button className="cancel_button">뒤로 가기</Button></Link>
        <Link to={`/admin/group/writer/${groupId}`}><Button className="edit_button">수정</Button></Link>
        <Button className="remove_button">삭제</Button>
      </section>
    </AdminTemplate>
  );
};

export default GroupDetailPage;