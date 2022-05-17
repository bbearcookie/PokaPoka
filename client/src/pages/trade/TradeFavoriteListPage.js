import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import produce from 'immer';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import Button from '../../components/form/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Select from '../../components/form/Select';
import MessageLabel from '../../components/MessageLabel';
import TradeList from '../../components/list/TradeList';
import TradeSideBar from '../../components/sidebar/TradeSideBar';
import UserTemplate from '../../templates/UserTemplate';
import './TradeFavoriteListPage.scss';

const TradeFavoriteListPage = () => {
  const [trades, setTrades] = useState([]);
  const [message, setMessage] = useState('');
  const request = useRequest();
  const navigate = useNavigate();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      // TODO: 자신이 찜한 모든 교환글 목록 가져오기
      const res = await request.call(api.getTradeListFavorite);
      setTrades(res.trades);
      console.log(res);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }
  useEffect(() => { onLoad(); }, []);

  // 교환글 상세 보기시 작동
  const onClickDetailView = (e) => {
    const tradeId = e.currentTarget.getAttribute('trade_id');

    return navigate(`/trade/detail/${tradeId}?backURI=/trade/favorite`);
  }

  // 찜하기 버튼 클릭시 작동
  const onClickFavorite = async (e) => {
    e.stopPropagation();
    const tradeId = e.currentTarget.getAttribute('trade_id');

    try {
      const res = await request.call(api.postTradeFavorite, tradeId);
      setTrades(trades.filter(trade => trade.trade_id !== parseInt(tradeId)));
      // setTrades(
      //   trades.map(trade =>
      //     trade.trade_id === parseInt(tradeId) ?
      //     { ...trade, favorites: res.favorites } :
      //     { ...trade }
      //   )
      // );
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }

  return (
    <UserTemplate
      className="TradeFavoriteListPage"
      sidebar={<TradeSideBar />}
    >
      {request.loading ? <LoadingSpinner /> : null}

      <h1 className="title-label">찜한 교환글 목록</h1>
      {message ? <MessageLabel>{message}</MessageLabel> : null}
      
      <TradeList contents={trades} perPage="10" onDetailView={onClickDetailView} onFavorite={onClickFavorite} />
    </UserTemplate>
  );
};

export default TradeFavoriteListPage;