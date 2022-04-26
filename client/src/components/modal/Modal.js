import React from 'react';
import classnames from 'classnames';
import './Modal.scss';

const Modal = ({ className, children }) => {
  return (
    <section className="ModalWrapper">
      <article className={classnames("Modal", className)}>
        {children}
      </article>
    </section>
  );
};

export default Modal;