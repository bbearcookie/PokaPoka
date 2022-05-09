import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { getFormattedDate } from '../../utils/common';
import Table from '../table/Table';
import PaginationBar from '../PaginationBar';
import './UserList.scss';

const UserList = ({ className, users, perPage }) => {
  const [currentPage, setCurrentPage] = useState(1); // 화면에 보여줄 현재 페이지 번호
  const numPages = Math.ceil(users.length / perPage); // 총 페이지 갯수
  const navigate = useNavigate();
  let count = 0;
  
  // 상세 보기시 작동
  const onClickDetailView = (e) => {
    const username = e.currentTarget.getAttribute('username');
    
    return navigate(`/admin/user/detail/${username}`);
  }
  
  // 해당 공지사항이 현재 페이지에 조회되어야 할 내용인지를 체크. true or false 반환.
  const isInCurrentPage = (count) => {
    const first = (currentPage - 1) * parseInt(perPage); // 현재 페이지에서 가장 처음으로 보여줄 문의사항의 id
    const last = first + parseInt(perPage); // 현재 페이지에서 가장 마지막으로 보여줄 문의사항의 id / 수정 전 const last = first + parseInt(perPage) - 1;

    if (count > first && count <= last) return true;  //수정 전 if (noticeId >= first && noticeId <= last) return true;
    return false;
  }

  return (
    <div className={classNames('UserList', className)}>
      <Table>
        <thead>
          <tr>
            <th className="username">아이디</th>
            <th className="name">이름</th>
            <th className="phone">전화번호</th>
            <th className="nickname">닉네임</th>
            <th className="favorite">최애그룹</th>
            <th className="regist_time">등록일</th>
          </tr>
        </thead>
        <tbody>
        {users ?
          users.filter(user => isInCurrentPage(++count)).map(user => 
            <tr key={count} username={user.username} onClick={onClickDetailView}>
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td>{user.phone}</td>
                <td>{user.nickname}</td>
                <td>{user.favorite}</td>
                <td>{getFormattedDate(user.regist_time)}</td>
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

UserList.defaultProps = {
  users: []
};

export default UserList;