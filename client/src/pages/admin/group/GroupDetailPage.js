import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { BACKEND } from '../../../utils/api';
import AlbumCard from '../../../components/card/AlbumCard';
import MemberCard from '../../../components/card/MemberCard';
import Button from '../../../components/form/Button';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import Modal from '../../../components/modal/Modal';
import ModalHeader from '../../../components/modal/ModalHeader';
import ModalBody from '../../../components/modal/ModalBody';
import ModalFooter from '../../../components/modal/ModalFooter';
import AdminTemplate from '../../../templates/AdminTemplate';
import './GroupDetailPage.scss';

// 성별 속성에 따라 화면에 보여줄 텍스트
const gender = {
  'm': '혼성',
  'g': '걸그룹',
  'b': '보이그룹'
}

// 그룹 상세 조회 페이지
const GroupDetailPage = () => {
  const { groupId } = useParams(); // URL에 포함된 groupId Params 정보
  const [group, setGroup] = useState({ // 그룹 상세 정보
    name: '',
    description: '',
    gender: '',
    image_name: ''
  });
  const [members, setMembers] = useState([]); // 그룹에 속한 멤버들 정보
  const [albums, setAlbums] = useState([]); // 그룹에 속한 앨범들 정보
  const [showModal, setShowModal] = useState(false); // 삭제 모달 창 화면에 띄우기 on/off
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const request = useRequest();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {

      // 그룹 정보 가져오기
      let res = await request.call(api.getAdminGroupDetail, groupId);
      setGroup({
        name: res.group.name,
        description: res.group.description,
        gender: res.group.gender,
        image_name: res.group.image_name
      });

      // 그룹에 속한 멤버 정보 가져오기
      res = await request.call(api.getAdminMemberList, groupId);
      setMembers(res.members);

      // 그룹에 속한 앨범 정보 가져오기
      res = await request.call(api.getAdminAlbumList, groupId);
      setAlbums(res.albums);
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
      const res = await request.call(api.deleteAdminGroup, groupId);
      return navigate('/admin/group');
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
          <h1>아이돌 그룹 삭제</h1>
        </ModalHeader>
        <ModalBody>
          <p>정말로 {group.name}을(를) 삭제하시겠습니까?</p>
        </ModalBody>
        <ModalFooter>
          <Button className="cancel_button" onClick={closeModal}>취소</Button>
          <Button className="remove_button" onClick={onClickRemove}>삭제</Button>
        </ModalFooter>
      </Modal> : null}

      {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
      {request.loading ? <LoadingSpinner /> : null}

      <h1 className="title-label">아이돌 그룹 상세 정보</h1>
      {message ? <MessageLabel>{message}</MessageLabel> : null}
      <section className="label_area">
        <p className="label">이미지</p>
        <img 
            width="200px"
            height="200px"
            src={`${BACKEND}/image/group/${group.image_name}`}
            onError={e => e.target.src = '/no_image.jpg'}
            alt="그룹"
        />
      </section>
      <section className="label_area">
        <p className="label">이름</p>
        <p>{group.name}</p>
      </section>
      <section className="label_area">
        <p className="label">설명</p>
        <p>{group.description}</p>
      </section>
      <section className="label_area">
        <p className="label">성별</p>
        <p>{gender[group.gender]}</p>
      </section>
      <section className="submit_section">
        <Link to="/admin/group"><Button className="cancel_button">뒤로 가기</Button></Link>
        <Link to={`/admin/group/writer/${groupId}`}><Button className="edit_button">수정</Button></Link>
        <Button className="remove_button" onClick={openModal}>삭제</Button>
      </section>
      <section className="title_area">
        <h1 className="title-label">멤버 목록</h1>
        <Link to={`/admin/member/writer?groupId=${groupId}`}>
          <Button className="add_button">추가</Button>
        </Link>
      </section>
      <section className="card_section">
        {members ?
        members.map(member =>
          <MemberCard
            groupId={groupId}
            key={member.member_id}
            id={member.member_id}
            name={member.name}
            src={`${BACKEND}/image/member/${member.image_name}`}
          />
        ) : null}
      </section>
      <section className="title_area">
        <h1 className="title-label">앨범 목록</h1>
        <Link to={`/admin/album/writer?groupId=${groupId}`}>
          <Button className="add_button">추가</Button>
        </Link>
      </section>
      <section className="card_section">
        {albums ?
        albums.map(album =>
          <AlbumCard
            groupId={groupId}
            key={album.album_id}
            id={album.album_id}
            name={album.name}
            src={`${BACKEND}/image/album/${album.image_name}`}
          />
        ) : null}
      </section>
    </AdminTemplate>
  );
};

export default GroupDetailPage;