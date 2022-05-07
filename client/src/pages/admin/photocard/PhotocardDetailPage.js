import React, { useState, useEffect } from 'react';
import qs from 'qs';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { BACKEND } from '../../../utils/api';
import Button from '../../../components/form/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import Modal from '../../../components/modal/Modal';
import ModalHeader from '../../../components/modal/ModalHeader';
import ModalBody from '../../../components/modal/ModalBody';
import ModalFooter from '../../../components/modal/ModalFooter';
import AdminTemplate from '../../../templates/AdminTemplate';
import './PhotocardDetailPage.scss';

const PhotocardDetailPage = () => {
  const { photocardId } = useParams(); // URL에 포함된 photocardId Params 정보
  const { backURI } = qs.parse(window.location.search, { ignoreQueryPrefix: true });
  const [photocard, setPhotocard] = useState({
    name: '',
    image_name: ''
  });
  const [group, setGroup] = useState({
    name: '',
    image_name: ''
  });
  const [member, setMember] = useState({
    name: '',
    image_name: ''
  });
  const [album, setAlbum] = useState({
    name: '',
    image_name: ''
  });
  const [showModal, setShowModal] = useState(false); // 삭제 모달 창 화면에 띄우기 on/off
  const [message, setMessage] = useState('');
  const request = useRequest();
  const navigate = useNavigate();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      // 포토카드 정보 가져오기
      const res = await request.call(api.getPhotocardDetail, photocardId);
      setPhotocard({
        name: res.photocard.name,
        image_name: res.photocard.image_name
      });
      setGroup({
        name: res.group.name,
        image_name: res.group.image_name
      });
      setMember({
        name: res.member.name,
        image_name: res.member.image_name
      });
      setAlbum({
        name: res.album.name,
        image_name: res.album.image_name
      });
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);
  
  // 삭제 모달 열기 / 닫기
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  // 뒤로가기 버튼 클릭시
  const onClickBackButton = () => {
    if (backURI) {
      return navigate(backURI);
    }
    
    return navigate("/admin/photocard");
  };

  // 삭제 버튼 클릭시
  const onClickRemove = async () => {
    try {
      const res = await request.call(api.deletePhotocard, photocardId);
      setMessage(res.message);
      return navigate(`/admin/photocard`);
    } catch (err) {
      setMessage(err.response.data.message);
    }
    closeModal();
  }

  return (
    <AdminTemplate className="AdminPhotocardDetailPage">

      {/* 삭제 버튼 눌리면 삭제 모달 창 띄움 */}
      {showModal ?
      <Modal className="remove_modal" onClose={closeModal}>
        <ModalHeader onClose={closeModal}>
          <h1>포토카드 삭제</h1>
        </ModalHeader>
        <ModalBody>
          <p>정말로 {photocard.name}을(를) 삭제하시겠습니까?</p>
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeModal}>취소</Button>
          <Button className="remove_button" onClick={onClickRemove}>삭제</Button>
        </ModalFooter>
      </Modal> : null}

      {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
      {request.loading ? <LoadingSpinner /> : null}

      <h1 className="title-label">포토카드 상세 정보</h1>
      {message ? <MessageLabel>{message}</MessageLabel> : null}
      <section className="label_area">
        <p className="label">포토카드 이미지</p>
        <img 
            width="200px"
            height="200px"
            src={`${BACKEND}/image/photocard/${photocard.image_name}`}
            onError={e => e.target.src = '/no_image.jpg'}
            alt="포토카드"
        />
      </section>
      <section className="label_area">
        <p className="label">이름</p>
        <p>{photocard.name}</p>
      </section>
      <section className="label_area">
        <p className="label">포토카드에 속한 정보</p>
        <section className="info_area">
          <section className="detail_info_area">
            <img 
              width="200px"
              height="200px"
              src={`${BACKEND}/image/group/${group.image_name}`}
              onError={e => e.target.src = '/no_image.jpg'}
              alt="그룹"
            />
            <p className="label">[그룹]</p>
            <p>{group.name}</p>
          </section>
          <section className="detail_info_area">
            <img 
              width="200px"
              height="200px"
              src={`${BACKEND}/image/member/${member.image_name}`}
              onError={e => e.target.src = '/no_image.jpg'}
              alt="멤버"
            />
            <p className="label">[멤버]</p>
            <p>{member.name}</p>
          </section>
          <section className="detail_info_area">
            <img 
              width="200px"
              height="200px"
              src={`${BACKEND}/image/album/${album.image_name}`}
              onError={e => e.target.src = '/no_image.jpg'}
              alt="앨범"
            />
            <p className="label">[앨범]</p>
            <p>{album.name}</p>
          </section>
        </section>
      </section>
      <section className="submit_section">
          {/* <Link to="/admin/photocard"><Button className="cancel_button" onClick={onClickBackButton}>뒤로 가기</Button></Link> */}
          <Button className="cancel_button" onClick={onClickBackButton}>뒤로 가기</Button>
          <Link to={`/admin/photocard/writer/${photocardId}`}><Button className="edit_button">수정</Button></Link>
          <Button className="remove_button" onClick={openModal}>삭제</Button>
      </section>

    </AdminTemplate>
  );
};

export default PhotocardDetailPage;