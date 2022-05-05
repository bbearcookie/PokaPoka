import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/form/Button';
import UserTemplate from '../../templates/UserTemplate';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import useRequest from '../../utils/useRequest';
import SuggestionList from '../../components/list/SuggestionList';
import LoadingSpinner from '../../components/LoadingSpinner';
import * as api from '../../utils/api';
import './SuggestionRequestListPage.scss';

const SuggestionRequestListPage = () => {
  const request = useRequest();
  const [suggestion, setSuggestion] = useState([]);

  // 화면 로드시 작동
  const onLoad = async (e) => {
    try {
      const res = await request.call(api.getSuggestionList);
      console.log(res);
      setSuggestion(res.suggestion);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <UserTemplate
      className="SuggestionRequestListPage"
      sidebar={<MyPageSidebar />}
    >
      {request.loading ? <LoadingSpinner /> : null}
      <section className="title_area">
        <h1 className="title-label">문의사항 목록</h1>
        <Link to="/mypage/suggestion/writer">
          <Button className="add_button">작성</Button>
        </Link>
      </section>

      <SuggestionList suggestions={suggestion} perPage="10" />

    </UserTemplate>
  );
};

export default SuggestionRequestListPage;