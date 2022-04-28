import React from 'react';
import classNames from 'classnames';
import './Button.scss';

// 기본 스타일이 지정된 버튼 컴포넌트.
const Button = ({ className, type, onClick, children }) => {
  return (
    <button
      className={classNames('Button', className)}
      type={type}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// props 매개변수를 전달 받지 않았을 때 기본 값
Button.defaultProps = {
  className: undefined,
  type: 'button',
  onClick: () => {},
};

export default Button;