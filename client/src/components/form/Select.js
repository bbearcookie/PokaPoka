import React from 'react';
import classNames from 'classnames';
import './Select.scss';

const Select = ({ className, name, children, onChange }) => {
  return (
    <select
      className={classNames('Select', className)}
      name={name}
      onChange={onChange}
    >
      {children}
    </select>
  );
};

Select.defaultProps = {
  onChange: () => {}
}

export default Select;