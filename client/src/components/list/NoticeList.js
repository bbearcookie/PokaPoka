import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { getFormattedDate } from '../../utils/common';
import Table from '../table/Table';
import PaginationBar from '../PaginationBar';
import './NoticeList.scss';

const NoticeList = ({ className, notices, perPage }) => {
  const [currentPage, setCurrentPage] = useState(1); // 화면에 보여줄 현재 페이지 번호
  const numPages = Math.ceil(notices.length / perPage); // 총 페이지 갯수
  const navigate = useNavigate();
  let count = 0;
  
  // 공지사항 상세 보기시 작동
  const onClickDetailView = (e) => {
    const noticeId = e.currentTarget.getAttribute('notice_id');
    return navigate(`/admin/notice/detail/${noticeId}`);
  }
  
  // 해당 공지사항이 현재 페이지에 조회되어야 할 내용인지를 체크. true or false 반환.
  const isInCurrentPage = (noticeId) => {
    const first = (currentPage - 1) * parseInt(perPage); // 현재 페이지에서 가장 처음으로 보여줄 문의사항의 id
    const last = first + parseInt(perPage); // 현재 페이지에서 가장 마지막으로 보여줄 문의사항의 id / 수정 전 const last = first + parseInt(perPage) - 1;

    if (noticeId > first && noticeId <= last) return true;  //수정 전 if (noticeId >= first && noticeId <= last) return true;
    return false;
  }

  return (
    <div className={classNames('NoticeList', className)}>
      <Table>
        <thead>
          <tr>
            <th className="notice_id">번호</th>
            <th className="title">제목</th>
            <th className="username">작성자</th>
            <th className="write_time">등록일</th>
          </tr>
        </thead>
        <tbody>
        {notices ?
          notices.filter(notice => isInCurrentPage(++count)).map(notice => 
            <tr key={count} notice_id={notice.notice_id} onClick={onClickDetailView}>
                <td>{notice.notice_id}</td>
                <td>{notice.title}</td>
                <td>{notice.username}</td>
                <td>{getFormattedDate(notice.write_time)}</td>
            </tr>
          ) : null}
        </tbody>
      </Table>

      <section className="pagination_section">
        <PaginationBar
          numPages={numPages}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </section>
    </div>
  );
};

NoticeList.defaultProps = {
  notices: []
};

export default NoticeList;