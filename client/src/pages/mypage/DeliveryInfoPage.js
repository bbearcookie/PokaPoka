import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../../utils/api';
import useRequest from '../../utils/useRequest';
import Button from '../../components/form/Button';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import Modal from '../../components/modal/Modal';
import ModalHeader from '../../components/modal/ModalHeader';
import ModalBody from '../../components/modal/ModalBody';
import ModalFooter from '../../components/modal/ModalFooter';
import { Link } from 'react-router-dom';
import './DeliveryInfoPage.scss';

const DeliveryInfoPage = () => {
    const request = useRequest();
    const [users,setUsers]=useState({
        name: '',
        phone: '',
        address: ''
    });
    const [visible, setVisible] = useState(false);  // 주소 데이터가 있을 때와 없을 때 구분
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false); // 모달 창 화면에 띄우기 on/off
    const [modalContent, setModalContent] = useState({ // 모달의 header, body에 보여줄 메시지
      header: '',
      body: ''
    });
    const form = {    //삭제용 폼
      address: '',
      address_detail: ''
  }

    // 페이지 로드시 동작
    const onLoad = async () => {
        try {
          //회원 정보 가져오기
          let res = await request.call(api.getAddress);
          console.log('adress: '+res.user.address);
          if(res.user.address) setVisible(true);    // 주소가 있다면 배송 정보 출력
          console.log(visible);
          setUsers({
            name: res.user.name,
            phone: res.user.phone,
            address: res.user.address
          });
        } 
        catch (err) {
          console.error(err);
        }
    };
    useEffect(() => { onLoad(); }, []);

    //모달 창 열기 / 닫기
    const openModal = () => setShowModal(true);
    const closeModal = () => {
      setShowModal(false);
      navigate(0);
    }

    
    //삭제하기 버튼 클릭시
    const onClickDelete = async () => {
        try {
          //adress 값을 ''값으로 변경 요청
          const res = await request.call(api.putAddress, form);
          setModalContent({
            header: '주소 삭제',
            body: res.message
          });
        } 
        catch (err) {
          setModalContent({
            header: '주소 삭제',
            body: err.response.data.message
          });
        }
        finally {
          openModal();
        }
    };
    return(
        <UserTemplate className="DeliveryInfoPage" sidebar={<MyPageSidebar/>}>
            {/* 모달 창 */}
            {showModal ?
            <Modal onClose={closeModal}>
                <ModalHeader onClose={closeModal}>
                    <h1>{modalContent.header}</h1>
                </ModalHeader>
                <ModalBody>
                    <p>{modalContent.body}</p>
                </ModalBody>
                <ModalFooter>
                    <Button className="submit_button" onClick={closeModal}>확인</Button>
                </ModalFooter>
            </Modal> : null}
            <h1 className="h">배송정보</h1>
            <section className="delivery">
                <form>
                    {visible && <h1>{users.name}</h1>}
                    {visible && <h1>{users.phone}</h1>}
                    {visible ? (<h1>{users.address}</h1>) : (<p className='none'>아직 등록된 주소가 없습니다.</p>)}
                    {visible && <Button className="btn" onClick={onClickDelete}>삭제하기</Button>}
                </form>
            </section>
            <section className="delivery1">
                <Link to={"/mypage/deliveryinfo/write"}><Button className="btn" >배송정보 추가하기</Button></ Link>
            </section>

    </UserTemplate>
    );
};

export default DeliveryInfoPage;