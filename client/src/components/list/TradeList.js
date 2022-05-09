import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { getFormattedDate } from '../../utils/common';
import { BACKEND } from '../../utils/api';
import Table from '../table/Table';
import Badge from '../Badge';
import ImageCard from '../card/ImageCard';
import VoucherCard from '../card/VoucherCard';
import PaginationBar from '../PaginationBar';
import { STORAGE_KEY_NAME } from '../../contexts/Auth';
import './TradeList.scss';

// 테이블에 보여줄 임시 or 영구 소유권 여부
const permanentState = {
  0: 'temporary',
  1: 'permanent'
};

const TradeList = ({ className, contents, perPage }) => {
  const [currentPage, setCurrentPage] = useState(1); // 화면에 보여줄 현재 페이지 번호
  const numPages = Math.ceil(contents.length / perPage); // 총 페이지 갯수
  const navigate = useNavigate();

  const onLoad = () => {
  };
  useEffect(() => { onLoad(); }, []);

  // 상세 보기시 작동
  const onClickDetailView = (e) => {
    // const suggestionId = e.currentTarget.getAttribute('suggestion_id');

    // //사용자 역할을 확인하여 관리자일 경우 관리자 페이지로 일반 사용자일 경우 사용자페이지로 이동
    // let user = sessionStorage.getItem(STORAGE_KEY_NAME); // 세션 스토리지의 사용자 정보 가져옴
    // user = JSON.parse(user);
    // if (user.role == 'admin') return navigate(`/admin/suggestion/detail/${suggestionId}`);
    // else return navigate(`/mypage/suggestion/detail/${suggestionId}`);
  }
  
  // 해당 내용이 현재 페이지에 조회되어야 할 내용인지를 체크. true or false 반환.
  const isInCurrentPage = (contentId) => {
    const first = (currentPage - 1) * parseInt(perPage); // 현재 페이지에서 가장 처음으로 보여줄 내용의 id
    const last = first + parseInt(perPage); // 현재 페이지에서 가장 마지막으로 보여줄 내용의 id

    if (contentId > first && contentId <= last) return true;
    return false;
  }

  console.log(contents);

  return (
    <div className={classNames('TradeList', className)}>

      <section className="trade_section">
        {contents ?
          contents.filter((content, idx) => isInCurrentPage(idx + 1)).map((content, idx) => 
            <article className="content_item" key={idx} content_id={content.trade_id} onClick={onClickDetailView}>
              <section className="card_section">
                <VoucherCard
                  name={content.name}
                  albumName={content.album_name}
                  src={`${BACKEND}/image/photocard/${content.image_name}`}
                />
              </section>
              <section className="label_section">
                <p className="label"><b>작성자</b> {content.username}</p>
                <p className="label"><b>상태</b> <Badge type={content.state} /></p>
                <p className="label"><b>소유권 상태</b> <Badge type={permanentState[content.permanent]} /></p>
                <p className="label"><b>등록일</b> {getFormattedDate(content.regist_time)}</p>
                <p className="label"><b>원하는 포토카드</b> 하단 중에서 {content.want_amount}장</p>
                <section className="image_section">
                  {content.wantcards ?
                    content.wantcards.map(wantcard =>
                    <article className="image_item">
                      <img 
                        width="165px"
                        height="165px"
                        src={`${BACKEND}/image/photocard/${wantcard.image_name}`}
                        onError={e => e.target.src = '/no_image.jpg'}
                        alt="앨범"
                      />
                      <p>{wantcard.name}</p>
                    </article>
                  ) : null}
                </section>
              </section>
            </article>
          ) : null}
      </section>

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

TradeList.defaultProps = {
  contents: []
};

export default TradeList;