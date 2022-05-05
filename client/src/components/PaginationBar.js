import React, { useState } from 'react';
import classNames from 'classnames';
import './PaginationBar.scss';

// 페이지네이션 바. (numPages: 페이지 총 갯수, currentPage: 현재 보고있는 페이지, setCurrentPage: currentPage에 대한 세터)
const PaginationBar = ({ className, numPages, currentPage, setCurrentPage }) => {
  const [firstPage, setFirstPage] = useState(1); // 페이지네이션 바에 보여줄 첫 번째 페이지 번호

  // 페이지네이션 버튼 클릭시 해당 페이지로 이동
  const onClickPageButton = (e) => {
    setCurrentPage(parseInt(e.target.innerText));
  }

  // > 버튼 클릭시 현재 페이지네이션 바에 보이지 않는 다음 페이지로 이동
  const onClickNextPageButton = () => {
    if (firstPage + 10 <= numPages) {
      setCurrentPage(firstPage + 10);
      setFirstPage(firstPage + 10);
    } else {
      setCurrentPage(numPages);
    }
  }
  // < 버튼 클릭시 현재 페이지네이션 바에 보이지 않는 이전 페이지로 이동
  const onClickPrevPageButton = (e) => {
    if (firstPage - 10 >= 1) {
      setCurrentPage(firstPage - 10);
      setFirstPage(firstPage - 10);
    } else {
      setCurrentPage(1);
    }
  }

  // 페이지네이션 바에 보여줄 버튼의 갯수 반환
  const getNumOfPageButton = () => {
    if (numPages - firstPage >= 10) return 10;
    return numPages - firstPage + 1;
  }

  return (
    <article className={classNames("PaginationBar", className)}>
      <span className="page_button" onClick={onClickPrevPageButton}>&lt;</span>

      {Array(getNumOfPageButton()).fill().map((_, i) => 
        <span
          key={i + 1}
          className={classNames("page_button", {"active": currentPage === firstPage + i})}
          onClick={onClickPageButton}
      >{firstPage + i}</span>)}

      <span className="page_button" onClick={onClickNextPageButton}>&gt;</span>
    </article>
  );
};

export default PaginationBar;