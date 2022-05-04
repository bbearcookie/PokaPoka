import React from 'react';
import classNames from 'classnames';
import './ImageCard.scss';

const ImageCard = ({ className, src, name }) => {
  return (
    <div className={classNames("ImageCard", className)}>
      <img 
        width="100%"
        height="200px"
        src={src ? src : '/no_image.jpg'}
        onError={e => e.target.src = '/no_image.jpg'}
        alt="앨범"
      />
      <p className="name-label">{name}</p>
    </div>
  );
};

ImageCard.defaultProps = {
  name: '이름'
}

export default ImageCard;