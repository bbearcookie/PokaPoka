import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { getFormattedDate } from '../../utils/common';
import Table from '../table/Table';
import Badge from '../Badge';
import PaginationBar from '../PaginationBar';
import { STORAGE_KEY_NAME } from '../../contexts/Auth';
import './VoucherProvisionList.scss';

// 테이블에 보여줄 임시 or 영구 소유권 여부
const permanentState = {
  0: 'temporary',
  1: 'permanent'
};

const VoucherProvisionList = ({ className, provisions, perPage }) => {
  const [currentPage, setCurrentPage] = useState(1); // 화면에 보여줄 현재 페이지 번호
  const numPages = Math.ceil(provisions.length / perPage); // 총 페이지 갯수
  const navigate = useNavigate();

  // 발급 내역 상세 보기시 작동
  const onClickDetailView = (e) => {
    const provisionId = e.currentTarget.getAttribute('provision_id');

    // return navigate(`/admin/voucher/request/detail/${requestId}`);
  }
  
  // 해당 문의사항이 현재 페이지에 조회되어야 할 내용인지를 체크. true or false 반환.
  const isInCurrentPage = (provisionId) => {
    const first = (currentPage - 1) * parseInt(perPage); // 현재 페이지에서 가장 처음으로 보여줄 문의사항의 id
    const last = first + parseInt(perPage); // 현재 페이지에서 가장 마지막으로 보여줄 문의사항의 id const last = first + parseInt(perPage) - 1

    if (provisionId > first && provisionId <= last) return true; // if (suggestionId >= first && suggestionId <= last) return true;
    return false;
  }

  return (
    <div className={classNames('VoucherProvisionList', className)}>
      <Table>
        <thead>
          <tr>
            <th className="permanent">임시 소유권 여부</th>
            <th className="name">포토카드 이름</th>
            <th className="recipient">요청자</th>
            <th className="provider">발급자</th>
            <th className="provide_time">발급일</th>
          </tr>
        </thead>
        <tbody>
        {provisions ?
          provisions.filter((prov, idx) => isInCurrentPage(idx + 1)).map((prov, idx) => 
            <tr key={idx} provision_id={prov.provision_id} onClick={onClickDetailView}>
                <td>{<Badge type={permanentState[prov.permanent]} />}</td>
                <td>{prov.name}</td>
                <td>{prov.recipient}</td>
                <td>{prov.provider}</td>
                <td>{getFormattedDate(prov.provide_time)}</td>
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

VoucherProvisionList.defaultProps = {
  requests: []
};

export default VoucherProvisionList;