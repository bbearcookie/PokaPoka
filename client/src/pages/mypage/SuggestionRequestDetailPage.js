import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useRequest from '../../utils/useRequest';
import { BACKEND } from '../../utils/api';
import * as api from '../../utils/api';
import { getFormattedDate } from '../../utils/common';
import Button from '../../components/form/Button';
import Textarea from '../../components/form/Textarea';
import LoadingSpinner from '../../components/LoadingSpinner';
import MessageLabel from '../../components/MessageLabel';
import UserTemplate from '../../templates/UserTemplate';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import produce from 'immer';
import './SuggestionRequestDetailPage.scss';

// 문의 타입에 따라 화면에 보여줄 텍스트
const category = {
  'normal': '기타',
  'shipping': '배송',
  'voucher': '소유권',
  'contents': '제보',
  'trade': '거래'
}

// 문의 사항의 처리 상태에 따라 화면에 보여줄 텍스트
const suggestionState = {
  'waiting': '답변 대기중',
  'commented': '답변 완료'
}

// 문의사항 상세 조회 페이지
const SuggestionRequestDetailPage = () => {
  const { suggestionId } = useParams(); // URL에 포함된 suggestionId Params 정보
  const [suggestion, setSuggestion] = useState({ // 문의사항 상세 정보
    username: '', // 작성자
    title: '',
    content: '',
    category: '',
    state: '', // 문의 사항 처리 상태
    write_time: '',
    image_name: ''
  });
  const [reply, setReply] = useState({  //답변 정보
    reply: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const request = useRequest();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {

      // 문의사항 정보 가져오기
      let res = await request.call(api.getSuggestionDetail, suggestionId);
      setSuggestion({
        username: res.suggestion.username,
        title: res.suggestion.title,
        content: res.suggestion.content,
        category: res.suggestion.category,
        state: res.suggestion.state,
        write_time: res.suggestion.write_time,
        image_name: res.suggestion.image_name
      });
      if(res.reply){ // 답변이 있을 때 답변 정보 가져오기
        setReply(produce(draft => {
          draft.reply = res.reply.content;
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <UserTemplate className="SuggestionRequestDetailPage" sidebar={<MyPageSidebar />}>

      {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
      {request.loading ? <LoadingSpinner /> : null}

      <h1 className="title-label">문의사항 상세 정보</h1>
      {message ? <MessageLabel>{message}</MessageLabel> : null}
      {suggestion.image_name &&
      <section className="label_area">
        <p className="label">첨부 이미지</p>
        <img 
            width="200px"
            height="200px"
            src={`${BACKEND}/image/suggestion/${suggestion.image_name}`}
            onError={e => e.target.src = '/no_image.jpg'}
            alt="이미지"
        />
      </section>}
      <section className="label_area">
        <p className="label">작성자</p>
        <p>{suggestion.username}</p>
      </section>
      <section className="label_area">
        <p className="label">제목</p>
        <p>{suggestion.title}</p>
      </section>
      <section className="label_area">
        <p className="label">내용</p>
        <p>{suggestion.content}</p>
      </section>
      <section className="label_area">
        <p className="label">문의 타입</p>
        <p>{category[suggestion.category]}</p>
      </section>
      <section className="label_area">
        <p className="label">처리 상태</p>
        <p>{suggestionState[suggestion.state]}</p>
      </section>
      <section className="label_area">
        <p className="label">작성일</p>
        <p>{getFormattedDate(suggestion.write_time)}</p>
      </section>
      <section className="submit_section">
        <Link to="/mypage/suggestion"><Button className="cancel_button">뒤로 가기</Button></Link>
      </section>
      <section className="label_area">
        <h1 className="label">답변</h1>
        <Textarea
          name="reply"
          value={reply.reply}
          placeholder="답변 대기중"
        />
      </section>
    </UserTemplate>
  );
};

export default SuggestionRequestDetailPage;