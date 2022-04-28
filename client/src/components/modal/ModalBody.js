import React from 'react';
import classNames from 'classnames';
import './ModalBody.scss';

const ModalBody = ({ className, children }) => {
  return (
    <div className={classNames("ModalBody", className)}>
      {children}
    </div>
  );
};

export default ModalBody;