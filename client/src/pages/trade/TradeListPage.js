import React from 'react';
import UserTemplate from '../../templates/UserTemplate';
import TradeSideBar from '../../components/sidebar/TradeSideBar';
import './TradeListPage.scss';

const TradeListPage = () => {
  return (
    <UserTemplate
      className="TradeListPage"
      sidebar={<TradeSideBar />}
    >
      <p>교환글 목록 페이지</p>
    </UserTemplate>
  );
};

export default TradeListPage;