import React from 'react';
import classNames from 'classnames';
import Badge from '../Badge';
import { getFormattedDate } from '../../utils/common';
import VoucherCard from './VoucherCard';
import { BACKEND } from '../../utils/api';
import './TradeCard.scss';

const TradeCard = ({ className, tradeId, username, name, imageName, albumName, state, permanentState, registTime, wantAmount, wantcards, onClick }) => {
  return (
    <article
      className={classNames("TradeCard", className)}
      key={tradeId}
      tradeId={tradeId}
      onClick={onClick}
    >
      <section className="card_section">
        <VoucherCard
          name={name}
          albumName={albumName}
          src={`${BACKEND}/image/photocard/${imageName}`}
        />
      </section>
      <section className="label_section">
        <p className="label"><b>작성자</b> {username}</p>
        <p className="label"><b>상태</b> <Badge type={state} /></p>
        <p className="label"><b>소유권 상태</b> <Badge type={permanentState} /></p>
        <p className="label"><b>등록일</b> {getFormattedDate(registTime)}</p>
        <p className="label"><b>원하는 포토카드</b> 아래 카드 중 {wantAmount}장</p>
        <section className="image_section">
          {wantcards ?
            wantcards.map(wantcard =>
            <article className="image_item">
              <img 
                width="165px"
                height="165px"
                src={`${BACKEND}/image/photocard/${wantcard.image_name}`}
                onError={e => e.target.src = '/no_image.jpg'}
                alt="앨범"
              />
              <p>{wantcard.name}</p>
            </article>
          ) : null}
        </section>
      </section>
    </article>
  );
};

TradeCard.defaultProps = {
  tradeId: 0,
  username: '작성자명',
  albumName: '앨범명',
  permanentState: '상태',
  wantAmount: 0,
  wantcards: [],
  onClick: () => {}
};

export default TradeCard;