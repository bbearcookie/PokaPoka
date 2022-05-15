import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import { BACKEND } from '../../utils/api';
import { getFormattedDate } from '../../utils/common';
import VoucherCard from './VoucherCard';
import './TradeExploreCard.scss';

const TradeExploreCard = ({ className, fromTrade, toTrade }) => {
  return (
    <article className={classNames("TradeExploreCard", className)}>
      <Link 
        className="card_section"
        to={fromTrade.trade_id ? `/trade/detail/${fromTrade.trade_id}?backURI=/trade/explore` : '#'}
      >
        <VoucherCard
          name={fromTrade.name}
          albumName={fromTrade.album_name}
          src={`${BACKEND}/image/photocard/${fromTrade.image_name}`}
        />
        <div><b>아이디</b> {fromTrade.username}</div>
        {fromTrade.regist_time && <div><b>등록일</b> {getFormattedDate(fromTrade.regist_time)}</div>}
      </Link>
      {/* <div className="arrow_section">
        &gt;&gt;&gt;
      </div> */}
      <div className="arrow_section">
        <img width="100px" height="100px" src="/arrow-right.png" alt="화살표" />
      </div>
      <Link
        className="card_section"
        to={toTrade.trade_id ? `/trade/detail/${toTrade.trade_id}?backURI=/trade/explore` : '#'}
      >
        <VoucherCard
          name={toTrade.name}
          albumName={toTrade.album_name}
          src={`${BACKEND}/image/photocard/${toTrade.image_name}`}
        />
        <div><b>아이디</b> {toTrade.username}</div>
        {toTrade.regist_time && <div><b>등록일</b> {getFormattedDate(toTrade.regist_time)}</div>}
      </Link>
    </article>
  );
};

TradeExploreCard.defaultProps = {
  fromTrade: {
    album_name: '앨범명',
    image_name: '',
    name: '이름',
    username: '사용자',
    photocard_id: undefined,
    regist_time: undefined,
    trade_id: undefined,
    want_photocard_id: undefined
  },
  toTrade: {
    album_name: '앨범명',
    image_name: '',
    name: '이름',
    username: '아이디',
    photocard_id: undefined,
    regist_time: undefined,
    trade_id: undefined,
    want_photocard_id: undefined
  },
};

export default TradeExploreCard;