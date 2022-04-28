import React from 'react';
import classnames from 'classnames';
import './Modal.scss';

const Modal = ({ className, children, onClose }) => {
  return (
    <section className="ModalWrapper" onClick={onClose}>
      <article className={classnames("Modal", className)}>
        {children}
      </article>
    </section>
  );
};

Modal.defaultProps = {
  onClose: () => {}
};

export default Modal;