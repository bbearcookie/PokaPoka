import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import './PhotocardCard.scss';

const PhotocardCard = ({ className, id, src, name }) => {
  return (
    <Link className={classNames("PhotocardCard", className)} to={`/admin/photocard/detail/${id}`}>
      <img 
        width="100%"
        height="200px"
        src={src ? src : '/no_image.jpg'}
        onError={e => e.target.src = '/no_image.jpg'}
        alt="포토카드"
      />
      <p className="name-label">{name}</p>
    </Link>
  );
};

PhotocardCard.defaultProps = {
  name: '포토카드 이름'
}

export default PhotocardCard;