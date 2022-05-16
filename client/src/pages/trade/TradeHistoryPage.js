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
import TradeList from '../../components/list/TradeList';
import TradeSideBar from '../../components/sidebar/TradeSideBar';
import UserTemplate from '../../templates/UserTemplate';
import './TradeHistoryPage.scss';

const TradeHistoryPage = () => {
  const [message, setMessage] = useState('');
  const request = useRequest();

  return (
    <UserTemplate
      className="TradeHistoryPage"
      sidebar={<TradeSideBar />}
    >
    {request.loading ? <LoadingSpinner /> : null}
    {message ? <MessageLabel>{message}</MessageLabel> : null}
    <h1 className="title-label">교환 내역</h1>
    <p className="label">보낸 포토카드 기록</p>
    <p className="label">받은 포토카드 기록</p>

    </UserTemplate>
  );
};

export default TradeHistoryPage;