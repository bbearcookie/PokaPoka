import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import { BACKEND } from '../../../utils/api';
import * as api from '../../../utils/api';
import { getFormattedDate } from '../../../utils/common';
import Button from '../../../components/form/Button';
import Textarea from '../../../components/form/Textarea';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import Badge from '../../../components/Badge';
import Modal from '../../../components/modal/Modal';
import ModalHeader from '../../../components/modal/ModalHeader';
import ModalBody from '../../../components/modal/ModalBody';
import ModalFooter from '../../../components/modal/ModalFooter';
import AdminTemplate from '../../../templates/AdminTemplate';
import produce from 'immer';
import './SuggestionDetailPage.scss';

// 문의 타입에 따라 화면에 보여줄 텍스트
const category = {
  'normal': '일반',
  'shipping': '배송',
  'voucher': '소유권',
  'contents': '새로운 데이터 추가',
  'trade': '거래'
}

// 문의 사항의 처리 상태에 따라 화면에 보여줄 텍스트
const suggestionState = {
  'waiting': '답변 대기중',
  'commented': '답변 완료'
}

// 문의사항 상세 조회 페이지
const SuggestionDetailPage = () => {
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
  const [showModal, setShowModal] = useState(false); // 삭제 모달 창 화면에 띄우기 on/off
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const request = useRequest();

  // input 값 변경시
  const onChangeInput = (e) => {
    setReply(produce(draft => {
      draft[e.target.name] = e.target.value;
    }));
  }

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {

      // 문의사항 정보 가져오기
      let res = await request.call(api.getSuggestionDetail, suggestionId);
      console.log(res);
      console.log("작성일: "+res.suggestion.write_time);
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

  // 삭제 모달 열기 / 닫기
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // 삭제 버튼 클릭시
  const onClickRemove = async () => {
    try {
      const res = await request.call(api.deleteSuggestion, suggestionId);
      return navigate('/admin/suggestion');
    } catch (err) {
      setMessage(err.response.data.message);
    }
    closeModal();
  }

  // (답변) 작성 버튼 클릭시
  const onClickReply = async () => {
    try {
      const res = await request.call(api.postReply, reply, suggestionId);
      return navigate(0);
    } catch (err) {
      setMessage(err.response.data.message);
    }
    closeModal();
  }

  return (
    <AdminTemplate className="AdminGroupDetailPage">

      {/* 삭제 버튼 눌리면 삭제 모달 창 띄움 */}
      {showModal ?
      <Modal className="remove_modal" onClose={closeModal}>
        <ModalHeader onClose={closeModal}>
          <h1>문의사항 삭제</h1>
        </ModalHeader>
        <ModalBody>
          <p>정말로 {suggestion.title}을(를) 삭제하시겠습니까?</p>
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeModal}>취소</Button>
          <Button className="remove_button" onClick={onClickRemove}>삭제</Button>
        </ModalFooter>
      </Modal> : null}

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
        <Link to="/admin/suggestion"><Button className="cancel_button">뒤로 가기</Button></Link>
        <Button className="remove_button" onClick={openModal}>삭제</Button>
      </section>
      <section className="label_area">
        <h1 className="label">답변</h1>
        <Textarea
          name="reply"
          value={reply.reply}
          placeholder="답변을 입력하세요"
          onChange={onChangeInput}
        />
        {reply.reply ? <Button className="write_button" onClick={onClickReply}>수정</Button>:
        <Button className="write_button" onClick={onClickReply}>작성</Button>}
      </section>
    </AdminTemplate>
  );
};

export default SuggestionDetailPage;