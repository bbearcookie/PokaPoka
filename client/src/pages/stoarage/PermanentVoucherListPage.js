import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import { BACKEND } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/form/Button';
import MessageLabel from '../../components/MessageLabel';
import Select from '../../components/form/Select';
// import ImageCard from '../../components/card/ImageCard';
import VoucherCard from '../../components/card/VoucherCard';
import PhotoStoarageSidebar from '../../components/sidebar/PhotoStoarageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import './PermanentVoucherListPage.scss';

// TODO: 페이지 로드시 사용자의 모든 소유권 가져온 다음에, 그룹별로 묶어서 화면에 보여주면 어떨까?
const PermanentVoucherListPage = () => {
  const [vouchers, setVouchers] = useState({});
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState('');
  const request = useRequest();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.getVoucherListMine, 1);
      setVouchers(res.vouchers);
      const res2 = await request.call(api.getGroupList);
      setGroups(res2.groups);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <UserTemplate
      className="PermanentVoucherListPage"
      sidebar={<PhotoStoarageSidebar />}
    >
      {request.loading ? <LoadingSpinner /> : null}
      {message ? <MessageLabel>{message}</MessageLabel> : null}

      <h1 className="title-label">보유한 정식 소유권</h1>
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
    </UserTemplate>
  );
};

export default PermanentVoucherListPage;