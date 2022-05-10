import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import { BACKEND } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/form/Button';
import MessageLabel from '../../components/MessageLabel';
import Select from '../../components/form/Select';
import VoucherCard from '../../components/card/VoucherCard';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import './ShippingRequestPage.scss';

//마이페이지 - 배송 요청
const ShippingRequestPage = () => {
  const [vouchers, setVouchers] = useState({});
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState('');
  const request = useRequest();
  const [users,setUsers]=useState({ // 배송 정보
    name: '',
    phone: '',
    address: ''
});
const [visible, setVisible] = useState(false);  // 주소 데이터가 있을 때와 없을 때 구분

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.getVoucherListMine, {
        permanent: 1
      });
      setVouchers(res.vouchers);
      const res2 = await request.call(api.getGroupList);
      setGroups(res2.groups);
      const res3 = await request.call(api.getAddress);
      if(res3.user.address) setVisible(true);    // 주소가 있다면 배송 정보 출력
      setUsers({
          name: res3.user.name,
          phone: res3.user.phone,
          address: res3.user.address
        });
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  //결제하기 버튼 클릭시
  const onClickPayment = async () => {
    //openModal();
  };

  return (
    <UserTemplate
      className="ShippingRequestPage"
      sidebar={<MyPageSidebar/>}
    >
      {request.loading ? <LoadingSpinner /> : null}
      {message ? <MessageLabel>{message}</MessageLabel> : null}

      <h1 className="title-label">배송 요청</h1>

      <p className="label">보유한 정식 소유권</p>
      <section className='voucher_section'>
        {groups ?
        groups.map(group =>
            <section className="card_section" key={group.group_id}>
            {vouchers.find(v => v.group_id === group.group_id) &&
            <p className="label">{group.name}</p>}
            {vouchers.filter(v => v.group_id === group.group_id).map(v =>
                <VoucherCard
                key={v.voucher_id}
                name={v.name}
                albumName={v.album_name}
                src={`${BACKEND}/image/photocard/${v.image_name}`}
                />
            )}
            </section>
        ) : null}
      </section>
      <p className="label">배송 정보</p>
      <section className="delivery">
        <form>
            {visible && <h1>{users.name}</h1>}
            {visible && <h1>{users.phone}</h1>}
            {visible ? (<h1>{users.address}</h1>) : (<p className='none'>아직 등록된 주소가 없습니다.</p>)}
            {visible ?  null : <Link to={"/mypage/deliveryinfo"}><Button className="btn">등록 페이지로 이동</Button></ Link>}
        </form>
      </section>
      <p className="label">결제 정보</p>
      <section className="delivery">
        <form>
            <p className='none'>작성중...</p>
        </form>
      </section>
      <p className="label">최종 정보</p>
      <section className="delivery">
        <form>
            <p className='none'>작성중...</p>
        </form>
      </section>
      <Button className="payment_button" onClick={onClickPayment}>결제하기</Button>
    </UserTemplate>
  );
};

export default ShippingRequestPage;