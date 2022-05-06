import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import produce from 'immer';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { BACKEND } from '../../../utils/api';
import AdminTemplate from '../../../templates/AdminTemplate';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import ImageCard from '../../../components/card/ImageCard';
import Input from '../../../components/form/Input';
import Select from '../../../components/form/Select';
import Textarea from '../../../components/form/Textarea';
import Button from '../../../components/form/Button';
import './VoucherProvisionWriter.scss';

const VoucherProvisionWriter = () => {
  const { requestId } = useParams(); // URL에 포함된 requestId Params 정보
  const [form, setForm] = useState({
    recipient: '',
    permanent: '0',
    groupId: '',
    memberId: '',
    photocardId: '',
  });
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [photocards, setPhotocards] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const request = useRequest();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.getGroupList);
      setGroups(res.groups);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }
  useEffect(() => { onLoad(); }, []);

  // 화면에 보여줄 포토카드 목록 업데이트
  const onUpdatePhotocards = async (e) => {
    try {
      const res = await request.call(api.getPhotocardList, form.groupId, form.memberId);
      setPhotocards(res.photocards);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };
  useEffect(() => { onUpdatePhotocards(); }, [form.groupId, form.memberId]);

  // 그룹 선택 변경시 동작
  const onChangeGroupSelect = async (e) => {
    setForm(produce(draft => {
      draft.groupId = e.target.value;
    }));

    if (e.target.value === '') {
      setMembers([]);
    } else if (e.target.value === 'all') {
      try {
        const res = await request.call(api.getAllMemberList);
        setMembers(res.members);
      } catch (err) {
        setMessage(err.response.data.message);
      }
    } else {
      try {
        const res = await request.call(api.getMemberList, e.target.value);
        setMembers(res.members);
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
  }

  // 멤버 선택 변경시 동작
  const onChangeMemberSelect = async (e) => {
    setForm(produce(draft => {
      draft.memberId = e.target.value;
    }));
  }

  // input 값 변경시
  const onChangeInput = (e) => {
    setForm(produce(draft => {
      draft[e.target.name] = e.target.value;
    }));
  }

  // 포토카드 선택시
  const onClickPhotocard = (e) => {
    const target = e.currentTarget;
    const photocardId = target.getAttribute('value');

    setForm(produce(draft => {
      draft.photocardId = photocardId;
    }));
  }

  // 작성 취소 버튼 클릭시
  const onCancel = () => navigate(-1); // 뒤로 돌아가기

  // 작성 버튼 클릭시
  const onSubmit = async (e) => {
    e.preventDefault();

    console.log(form);
  }

  return (
    <AdminTemplate className="AdminVoucherProvisionWriter">
      {request.loading ? <LoadingSpinner /> : null}
      <form onSubmit={onSubmit}>
        <h1 className="title-label">포토카드 소유권 발급</h1>
        
        {message ? <MessageLabel>{message}</MessageLabel> : null}
        <p className="label">대상의 아이디</p>
        <Input
          type="text"
          name="recipient"
          value={form.recipient}
          autoComplete="off"
          placeholder="발급 대상의 아이디를 입력하세요"
          onChange={onChangeInput}
        />

        <p className="label">임시 소유권 여부</p>
        <Select name="permanent" value={form.permanent} onChange={onChangeInput}>
          <option value="0">임시</option>
          <option value="1">영구</option>
        </Select>

        <p className="label">포토카드 선택</p>
        <section className="search_area">
          <article className="search">
            <p className="label">그룹</p>
            <Select name="group" value={form.groupId} onChange={onChangeGroupSelect}>
              <option value="">선택</option>
              <option value="all">전체</option>
              {groups ?
              groups.map(group => 
                <option key={group.group_id} value={group.group_id}>{group.name}</option>
              ) : null}
            </Select>
          </article>

          <article className="search">
            <p className="label">멤버</p>
            <Select name="member" value={form.memberId} onChange={onChangeMemberSelect}>
              <option value="">선택</option>
              {form.groupId ? <option value="all">전체</option> : null}
              {members ?
              members.map(member =>
                <option key={member.member_id} value={member.member_id}>{member.name}</option>
              ) : null}
            </Select>
          </article>
        </section>

        <section className="card_section">
          {photocards ?
            photocards.map(photocard =>
              <ImageCard
                className={classNames({"active": photocard.photocard_id === parseInt(form.photocardId) })}
                key={photocard.photocard_id}
                value={photocard.photocard_id}
                name={photocard.name}
                src={`${BACKEND}/image/photocard/${photocard.image_name}`}
                onClick={onClickPhotocard}
              />
            ) : null}
        </section>

        <section className="submit_section">
          <Button className="cancel_button" type="button" onClick={onCancel}>취소</Button>
          <Button className="submit_button" type="submit">작성</Button>
        </section>
      </form>
    </AdminTemplate>
  );
};

export default VoucherProvisionWriter;