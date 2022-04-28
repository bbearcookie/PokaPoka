import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import './ModalHeader.scss';

const ModalHeader = ({ className, children, onClose }) => {
  return (
    <div className={classNames("ModalHeader", className)}>
      <div className="content_section">
        {children}
      </div>
      <FontAwesomeIcon className="close-icon" icon={faTimes} onClick={onClose} />
    </div>
  );
};

ModalHeader.defaultProps = {
  onClose: () => {}
};

export default ModalHeader;