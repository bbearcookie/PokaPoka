import React from 'react';
import classNames from 'classnames';
import { BACKEND } from '../../utils/api';
import { getFormattedDate, getFormattedTime } from '../../utils/common';
import VoucherCard from './VoucherCard';
import './TradeHistoryCard.scss';

const TradeHistoryCard = ({ className, historyId, provider, recipient, name, albumName, imageName, tradeTime }) => {
  return (
    <article className={classNames("TradeHistoryCard", className)}>
      <section className="card_section">
        <VoucherCard
          name={name}
          albumName={albumName}
          src={`${BACKEND}/image/photocard/${imageName}`}
        />
        {provider && <p className="label"><b>보낸사람</b> {provider}</p>}
        {recipient && <p className="label"><b>받은사람</b> {recipient}</p>}
        <p className="label"><b>교환일시</b></p>
        <p className="label">{getFormattedDate(tradeTime)}</p>
        <p className="label">{getFormattedTime(tradeTime)}</p>
      </section>
    </article>
  );
};

TradeHistoryCard.defaultProps = {
  historyId: 0,
  provider: '',
  recipient: '',
  name: '포토카드명',
  albumName: '앨범명'
}

export default TradeHistoryCard;