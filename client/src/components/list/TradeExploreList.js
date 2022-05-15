import React from 'react';
import classNames from 'classnames';
import TradeExploreCard from '../card/TradeExploreCard';
import './TradeExploreList.scss';

const TradeExploreList = ({ className, trades, haveVoucher }) => {
  return (
    <div className={classNames("TradeExploreList", className)}>
      {trades ?
      trades.map((_, idx) => {
        if (idx < trades.length - 1) {
          return (<TradeExploreCard key={trades[idx].trade_id} fromTrade={trades[idx]} toTrade={trades[idx + 1]} />);
        } else {
          return (
            <>
              <TradeExploreCard key={trades.length} fromTrade={trades[trades.length - 1]} toTrade={haveVoucher} />
              <TradeExploreCard key={trades.length + 1} fromTrade={haveVoucher} toTrade={trades[0]} />
            </>
          )
        }
      }) : null}
    </div>
  );
};

TradeExploreList.defaultProps = {
  trades: () => {},
  haveVoucher: {}
};

export default TradeExploreList;