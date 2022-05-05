import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import AdminTemplate from '../../../templates/AdminTemplate';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/form/Button';
import ImageCard from '../../../components/card/ImageCard';
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
        <Link to="/suggestion/writer">
          <Button className="add_button">작성</Button>
        </Link>
      </section>
      <section className="card_section">
        {suggestion ?
        suggestion.map(suggestion =>
          <Link to={`/suggestion/detail/${suggestion.suggestion_id}`}>
            <ImageCard
              key={suggestion.suggestion_id}
              name={suggestion.title}
              id={suggestion.suggestion_id}
              category={suggestion.category}
              username={suggestion.username}
              write_tiem={suggestion.write_tiem}
            />
          </Link>
        ) : null}
      </section>
    </AdminTemplate>
  );
};

export default SuggestionListPage;