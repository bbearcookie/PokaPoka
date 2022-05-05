import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import SuggestionList from '../../../components/list/SuggestionList';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/form/Button';
import AdminTemplate from '../../../templates/AdminTemplate';
import './SuggestionListPage.scss';

// 테스트용 더미 데이터 생성 (테스트용 함수임)
const createDummyList = () => {
  const list = [];

  for (let i = 0; i < 202; i++) {
    list.push({
      suggestion_id: i,
      category: 'voucher',
      state: 'waiting',
      title: `${i}번째 게시글`,
      username: 'testman',
      write_tile: new Date('2022-05-05')
    });
  }


  return list;
}

// 문의사항 목록 조회 페이지
const SuggestionListPage = () => {
  const request = useRequest();
  const [suggestion, setSuggestion] = useState([]);
  const navigate = useNavigate();

  // 화면 로드시 작동
  const onLoad = async (e) => {
    try {
      const res = await request.call(api.getSuggestionList);
      setSuggestion(res.suggestion_admin);
      // setSuggestion(createDummyList()); // 페이지네이션 기능 테스트를 위한 더미 데이터
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <AdminTemplate className="SuggestionListPage">
      {request.loading ? <LoadingSpinner /> : null}
      <section className="title_area">
        <h1 className="title-label">문의사항 목록</h1>
        <Link to="/admin/suggestion/writer">
          <Button className="add_button">작성</Button>
        </Link>
      </section>

      <SuggestionList suggestions={suggestion} perPage="10" />

    </AdminTemplate>
  );
};

export default SuggestionListPage;