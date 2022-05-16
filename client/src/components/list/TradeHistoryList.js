import React, { useState } from 'react';
import classNames from 'classnames';
import TradeHistoryCard from '../../components/card/TradeHistoryCard';
import PaginationBar from '../PaginationBar';
import './TradeHistoryList.scss';

const TradeHistoryList = ({ className, contents, perPage }) => {
  const [currentPage, setCurrentPage] = useState(1); // 화면에 보여줄 현재 페이지 번호
  const numPages = Math.ceil(contents.length / perPage); // 총 페이지 갯수

  // 해당 내용이 현재 페이지에 조회되어야 할 내용인지를 체크. true or false 반환.
  const isInCurrentPage = (contentId) => {
    const first = (currentPage - 1) * parseInt(perPage); // 현재 페이지에서 가장 처음으로 보여줄 내용의 id
    const last = first + parseInt(perPage); // 현재 페이지에서 가장 마지막으로 보여줄 내용의 id

    if (contentId > first && contentId <= last) return true;
    return false;
  }

  return (
    <div className={classNames("TradeHistoryList", className)}>

      <section className="history_section">
      {contents ?
          contents.filter((content, idx) => isInCurrentPage(idx + 1)).map((content, idx) => 
            <TradeHistoryCard
              key={content.history_id}
              historyId={content.history_id}
              provider={content.provider}
              recipient={content.recipient}
              name={content.name}
              imageName={content.image_name}
              albumName={content.album_name}
              tradeTime={content.trade_time}
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

export default TradeHistoryList;