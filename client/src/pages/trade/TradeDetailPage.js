import React, { useState, useEffect } from 'react';
import produce from 'immer';
import { Link } from 'react-router-dom';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import Button from '../../components/form/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Select from '../../components/form/Select';
import MessageLabel from '../../components/MessageLabel';
import TradeList from '../../components/list/TradeList';
import TradeSideBar from '../../components/sidebar/TradeSideBar';
import UserTemplate from '../../templates/UserTemplate';
import './TradeDetailPage.scss';

const TradeDetailPage = () => {
  const [message, setMessage] = useState('');
  const request = useRequest();

  return (
    <UserTemplate
      className="TradeDetailPage"
      sidebar={<TradeSideBar />}
    >
      {request.loading ? <LoadingSpinner /> : null}
      {message ? <MessageLabel>{message}</MessageLabel> : null}
      <h1 className="title-label">교환글 상세 정보</h1>

    </UserTemplate>
  );
};

export default TradeDetailPage;