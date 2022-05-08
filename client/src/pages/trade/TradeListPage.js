import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/form/Button';
import TradeSideBar from '../../components/sidebar/TradeSideBar';
import UserTemplate from '../../templates/UserTemplate';
import './TradeListPage.scss';

const TradeListPage = () => {
  return (
    <UserTemplate
      className="TradeListPage"
      sidebar={<TradeSideBar />}
    >
      <section className="title_area">
        <h1 className="title-label">교환글 목록</h1>
        <Link to="/trade/writer">
          <Button className="add_button">작성</Button>
        </Link>
      </section>
    </UserTemplate>
  );
};

export default TradeListPage;