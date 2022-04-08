import React from 'react';

const DBData = ({ author, text }) => {
  return (
    <div className="DBData">
      <div>------------------------------</div>
      <div>작성자: {author}</div>
      <div>내용: {text}</div>
    </div>
  );
};

export default DBData;