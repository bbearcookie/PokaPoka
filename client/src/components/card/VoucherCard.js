import React from 'react';
import classNames from 'classnames';
import './VoucherCard.scss';

const VoucherCard = ({ className, src, name, albumName, value, onClick, children }) => {
  return (
    <div className={classNames("VoucherCard", className)} value={value} onClick={onClick}>
      <img 
        width="100%"
        height="200px"
        src={src ? src : '/no_image.jpg'}
        onError={e => e.target.src = '/no_image.jpg'}
        alt="앨범"
      />
      <p className="name-label">{name}</p>
      <p className="album-label">{albumName}</p>
      {children}
    </div>
  );
};

VoucherCard.defaultProps = {
  name: '이름',
  albumName: '앨범',
  onClick: () => {}
};

export default VoucherCard;