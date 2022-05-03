import React from 'react';
import classNames from 'classnames';
import './Input.scss';

const Input = ({className, type, name, value, placeholder, autoComplete, maxLength, onChange}) => {
  return (
    <input
      className={classNames('Input', className)}
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      autoComplete={autoComplete}
      maxLength={maxLength}
      onChange={onChange}
    />
  );
};

export default Input;