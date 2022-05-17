import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import { BACKEND } from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/form/Button';
import MessageLabel from '../../components/MessageLabel';
import Select from '../../components/form/Select';
import VoucherCard from '../../components/card/VoucherCard';
import PhotoStoarageSidebar from '../../components/sidebar/PhotoStoarageSidebar';
import AuthContext from '../../contexts/Auth';
import UserTemplate from '../../templates/UserTemplate';
import './TemporalVoucherListPage.scss';

const TemporalVoucherListPage = () => {
  const { state: authState, actions: authActions } = useContext(AuthContext);
  const [initialVouchers, setInitialVouchers] = useState({});
  const [tradedVouchers, setTradedVouchers] = useState({});
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState('');
  const request = useRequest();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.getVoucherListMine, {
        permanent: 0,
        state: "initial"
      });
      setInitialVouchers(res.vouchers);
      const res2 = await request.call(api.getVoucherListMine, {
        permanent: 0,
        state: "traded"
      });
      setTradedVouchers(res2.vouchers);
      const res3 = await request.call(api.getGroupList);
      setGroups(res3.groups);
    } catch (err) {
      setMessage(err.response.data.message);
      authActions.verify();
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <UserTemplate
      className="TemporalVoucherListPage"
      sidebar={<PhotoStoarageSidebar />}
    >
    {request.loading ? <LoadingSpinner /> : null}
    {message ? <MessageLabel>{message}</MessageLabel> : null}
    
    <h1 className="title-label">사용 가능한 임시 소유권</h1>
    {groups ?
      groups.map(group =>
        <section className="card_section" key={group.group_id}>
          {initialVouchers.find(v => v.group_id === group.group_id) &&
          <p className="label">{group.name}</p>}
          {initialVouchers.filter(v => v.group_id === group.group_id).map(v =>
            <VoucherCard
              key={v.voucher_id}
              name={v.name}
              albumName={v.album_name}
              src={`${BACKEND}/image/photocard/${v.image_name}`}
            />
          )}
        </section>
      ) : null}

    <h1 className="title-label">대기중인 임시 소유권</h1>
    {groups ?
      groups.map(group =>
        <section className="card_section" key={group.group_id}>
          {tradedVouchers.find(v => v.group_id === group.group_id) &&
          <p className="label">{group.name}</p>}
          {tradedVouchers.filter(v => v.group_id === group.group_id).map(v =>
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

export default TemporalVoucherListPage;