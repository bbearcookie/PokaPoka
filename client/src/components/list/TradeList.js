import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { getFormattedDate } from '../../utils/common';
import { BACKEND } from '../../utils/api';
import Table from '../table/Table';
import Badge from '../Badge';
import VoucherCard from '../card/VoucherCard';
import TradeCard from '../card/TradeCard';
import PaginationBar from '../PaginationBar';
import { STORAGE_KEY_NAME } from '../../contexts/Auth';
import './TradeList.scss';

// 테이블에 보여줄 임시 or 영구 소유권 여부
const permanentState = {
  0: 'temporary',
  1: 'permanent'
};

const TradeList = ({ className, contents, perPage, onClick }) => {
  const [currentPage, setCurrentPage] = useState(1); // 화면에 보여줄 현재 페이지 번호
  const numPages = Math.ceil(contents.length / perPage); // 총 페이지 갯수
  const navigate = useNavigate();

  const onLoad = () => {
  };
  useEffect(() => { onLoad(); }, []);
  
  // 해당 내용이 현재 페이지에 조회되어야 할 내용인지를 체크. true or false 반환.
  const isInCurrentPage = (contentId) => {
    const first = (currentPage - 1) * parseInt(perPage); // 현재 페이지에서 가장 처음으로 보여줄 내용의 id
    const last = first + parseInt(perPage); // 현재 페이지에서 가장 마지막으로 보여줄 내용의 id

    if (contentId > first && contentId <= last) return true;
    return false;
  }

  return (
    <div className={classNames('TradeList', className)}>

      <section className="trade_section">
        {contents ?
          contents.filter((content, idx) => isInCurrentPage(idx + 1)).map((content, idx) => 
            <TradeCard
              key={content.trade_id}
              tradeId={content.trade_id}
              username={content.username}
              name={content.name}
              imageName={content.image_name}
              albumName={content.album_name}
              state={content.state}
              permanentState={permanentState[content.permanent]}
              registTime={content.regist_time}
              wantAmount={content.want_amount}
              wantcards={content.wantcards}
              onClick={onClick}
            />
          )
        : null}
      </section>

      <section className="pagination_section">
        <PaginationBar
          numPages={numPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </section>
    </div>
  );
};

TradeList.defaultProps = {
  contents: [],
  onClick: () => {}
};

export default TradeList;