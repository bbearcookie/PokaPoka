import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSelect, setGroups, setMembers, setAlbums, setTrades } from '../../modules/tradeListPage';
import produce from 'immer';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import Button from '../../components/form/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Select from '../../components/form/Select';
import Input from '../../components/form/Input';
import MessageLabel from '../../components/MessageLabel';
import TradeHistoryList from '../../components/list/TradeHistoryList';
import TradeSideBar from '../../components/sidebar/TradeSideBar';
import UserTemplate from '../../templates/UserTemplate';
import './TradeHistoryPage.scss';

const TradeHistoryPage = () => {
  const [provisionHistories, setProvisionHistories] = useState([]);
  const [reciptHistories, setReciptHistories] = useState([]);
  const [message, setMessage] = useState('');
  const request = useRequest();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.getTradeHistoryProvision);
      const res2 = await request.call(api.getTradeHistoryReceipt);
      setProvisionHistories(res.histories);
      setReciptHistories(res2.histories);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }
  useEffect(() => { onLoad(); }, []);

  return (
    <UserTemplate
      className="TradeHistoryPage"
      sidebar={<TradeSideBar />}
    >
    {request.loading ? <LoadingSpinner /> : null}
    {message ? <MessageLabel>{message}</MessageLabel> : null}
    <h1 className="title-label">교환 내역</h1>
    <p className="label">내가 줬던 기록</p>
    <TradeHistoryList contents={provisionHistories} perPage="4" />

    <p className="label">내가 받았던 기록</p>
    <TradeHistoryList contents={reciptHistories} perPage="4" />

    </UserTemplate>
  );
};

export default TradeHistoryPage;