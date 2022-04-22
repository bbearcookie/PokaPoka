import React from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import classNames from 'classnames';
import './Textarea.scss';

const TextArea = ({ className, name, value, placeholder, onChange }) => {
  return (
    <TextareaAutosize
      className={classNames("Textarea")}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
    />
  );
};

export default TextArea;