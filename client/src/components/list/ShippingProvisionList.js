import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { getFormattedDate } from '../../utils/common';
import Table from '../table/Table';
import Badge from '../Badge';
import PaginationBar from '../PaginationBar';
import { STORAGE_KEY_NAME } from '../../contexts/Auth';
import './ShippingProvisionList.scss';

const ShippingProvisionList = ({ className, provisions, perPage }) => {
  const [currentPage, setCurrentPage] = useState(1); // 화면에 보여줄 현재 페이지 번호
  const numPages = Math.ceil(provisions.length / perPage); // 총 페이지 갯수
  const navigate = useNavigate();

  // 발급 내역 상세 보기시 작동
  const onClickDetailView = (e) => {
    const requestId = e.currentTarget.getAttribute('request_id');

    return navigate(`/admin/shipping/request/detail/${requestId}`);
  }
  
  // 해당 문의사항이 현재 페이지에 조회되어야 할 내용인지를 체크. true or false 반환.
  const isInCurrentPage = (provisionId) => {
    const first = (currentPage - 1) * parseInt(perPage); // 현재 페이지에서 가장 처음으로 보여줄 문의사항의 id
    const last = first + parseInt(perPage); // 현재 페이지에서 가장 마지막으로 보여줄 문의사항의 id const last = first + parseInt(perPage) - 1

    if (provisionId > first && provisionId <= last) return true; // if (suggestionId >= first && suggestionId <= last) return true;
    return false;
  }

  return (
    <div className={classNames('ShippingProvisionList', className)}>
      <Table>
        <thead>
          <tr>
            <th className="provision_id">번호</th>
            <th className="request_id">요청 번호</th>
            <th className="photocards">포토카드</th>
            <th className="recipient">수령인</th>
            <th className="provider">발송인</th>
            <th className="provide_time">배송일</th>
          </tr>
        </thead>
        <tbody>
        {provisions ?
          provisions.filter((prov, idx) => isInCurrentPage(idx + 1)).map((prov, idx) => 
            <tr key={idx} request_id={prov.request_id} onClick={onClickDetailView}>
                <td>{prov.provision_id}</td>
                <td>{prov.request_id}</td>
                <td>{prov.wantcards[0].name} {prov.wantcards.length > 1 && <span>외 {prov.wantcards.length - 1}장</span>}</td>
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

ShippingProvisionList.defaultProps = {
  requests: []
};

export default ShippingProvisionList;