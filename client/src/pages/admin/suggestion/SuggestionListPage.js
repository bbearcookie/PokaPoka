import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import AdminTemplate from '../../../templates/AdminTemplate';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/form/Button';
import SuggestionCard from '../../../components/card/SuggestionCard';
import './SuggestionListPage.scss';

// 문의사항 목록 조회 페이지
const SuggestionListPage = () => {
  const request = useRequest();
  const [suggestion, setSuggestion] = useState([]);

  // 화면 로드시 작동
  const onLoad = async (e) => {
    try {
      const res = await request.call(api.getSuggestionList);
      setSuggestion(res.suggestion_admin);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <AdminTemplate className="AdminGroupListPage">
      {request.loading ? <LoadingSpinner /> : null}
      <section className="title_area">
        <h1 className="title-label">문의사항 목록</h1>
        <Link to="/admin/suggestion/writer">
          <Button className="add_button">작성</Button>
        </Link>
      </section>
      <section className="card_section">
        {suggestion ?
        suggestion.map(suggestion =>
          <SuggestionCard
            key={suggestion.suggestion_id}
            id={suggestion.suggestion_id}
            title={suggestion.title}
            category={suggestion.category}
            username={suggestion.username}
            write_tiem={suggestion.write_tiem}
          />
        ) : null}
      </section>
    </AdminTemplate>
  );
};

export default SuggestionListPage;