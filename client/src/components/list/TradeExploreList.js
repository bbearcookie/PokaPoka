import React from 'react';
import classNames from 'classnames';
import TradeExploreCard from '../card/TradeExploreCard';
import './TradeExploreList.scss';

const TradeExploreList = ({ className, trades, haveVoucher }) => {
  return (
    <div className={classNames("TradeExploreList", className)}>
      {/* 요청자 자신이 받고 보내는 내용을 보여줌 */}
      {trades && 
        <>
          <TradeExploreCard key={trades.length} fromTrade={trades[trades.length - 1]} toTrade={haveVoucher} />
          <TradeExploreCard key={trades.length + 1} fromTrade={haveVoucher} toTrade={trades[0]} />
        </>
      }

      {/* 그 외 교환글들끼리 연결되는 내용을 보여줌  */}
      {trades &&
      trades.map((_, idx) => {
        if (idx < trades.length - 1) {
          return (<TradeExploreCard key={trades[idx].trade_id} fromTrade={trades[idx]} toTrade={trades[idx + 1]} />);
        } else {
          return null;
        }
      })}

    </div>
  );
};

TradeExploreList.defaultProps = {
  trades: () => {},
  haveVoucher: {}
};

export default TradeExploreList;