import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { getFormattedDate } from '../../utils/common';
import Table from '../table/Table';
import Badge from '../Badge';
import PaginationBar from '../PaginationBar';
import { STORAGE_KEY_NAME } from '../../contexts/Auth';
import './VoucherRequestList.scss';

const VoucherRequestList = ({ className, requests, perPage }) => {
  const [currentPage, setCurrentPage] = useState(1); // 화면에 보여줄 현재 페이지 번호
  const numPages = Math.ceil(requests.length / perPage); // 총 페이지 갯수
  const navigate = useNavigate();
  let count = 0;

  console.log(requests);

  // 발급 요청 상세 보기시 작동
  const onClickDetailView = (e) => {
    // const requestId = e.currentTarget.getAttribute('request_id');

    // //사용자 역할을 확인하여 관리자일 경우 관리자 페이지로 일반 사용자일 경우 사용자페이지로 이동
    // let user = sessionStorage.getItem(STORAGE_KEY_NAME); // 세션 스토리지의 사용자 정보 가져옴
    // user = JSON.parse(user);
    // if (user.role == 'admin') return navigate(`/admin/suggestion/detail/${suggestionId}`);
    // else return navigate(`/mypage/suggestion/detail/${suggestionId}`);
  }
  
  // 해당 문의사항이 현재 페이지에 조회되어야 할 내용인지를 체크. true or false 반환.
  const isInCurrentPage = (suggestionId) => {
    const first = (currentPage - 1) * parseInt(perPage); // 현재 페이지에서 가장 처음으로 보여줄 문의사항의 id
    const last = first + parseInt(perPage); // 현재 페이지에서 가장 마지막으로 보여줄 문의사항의 id const last = first + parseInt(perPage) - 1

    if (suggestionId > first && suggestionId <= last) return true; // if (suggestionId >= first && suggestionId <= last) return true;
    return false;
  }

  return (
    <div className={classNames('VoucherRequestList', className)}>
      <Table>
        <thead>
          <tr>
            <th className="request_id">번호</th>
            <th className="state">처리 상태</th>
            <th className="delivery">택배사</th>
            <th className="tracking_number">운송장 번호</th>
            <th className="username">요청자</th>
            <th className="write_time">요청일</th>
          </tr>
        </thead>
        <tbody>
        {requests ?
          requests.filter(req => isInCurrentPage(++count)).map(req => 
            <tr key={count} request_id={req.request_id} onClick={onClickDetailView}>
                <td>{req.request_id}</td>
                <td><Badge type={req.state} /></td>
                <td>{req.delivery}</td>
                <td>{req.tracking_number}</td>
                <td>{req.username}</td>
                <td>{getFormattedDate(req.regist_time)}</td>
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

VoucherRequestList.defaultProps = {
  requests: []
};

export default VoucherRequestList;