import React from 'react';
import classNames from 'classnames';
import './ModalFooter.scss';

const ModalFooter = ({ className, children }) => {
  return (
    <div className={classNames("ModalFooter", className)}>
      {children}
    </div>
  );
};

export default ModalFooter;