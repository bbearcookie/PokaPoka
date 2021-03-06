import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import produce from 'immer';
import classNames from 'classnames';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { BACKEND } from '../../../utils/api';
import Input from '../../../components/form/Input';
import Button from '../../../components/form/Button';
import Select from '../../../components/form/Select';
import ImageCard from '../../../components/card/ImageCard';
import MessageLabel from '../../../components/MessageLabel';
import MyPageSidebar from '../../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../../templates/UserTemplate';
import './VoucherRequestWriterPage.scss';

const VoucherRequestWriterPage = () => {
  const { requestId } = useParams(); // URL에 포함된 voucherId Params 정보
  const [form, setForm] = useState({
    delivery: '',
    trackingNumber: '',
    groupId: '',
    memberId: '',
    photocardId: '',
    image: {
      file: '', // 업로드 된 실제 이미지 파일
      previewURL: '', // 브라우저에 임시로 보여줄 이미지 URL
      initialURL: '', // 브라우저에 보여줄 초기 이미지 URL. 작성시에는 빈 값이고 수정시에는 원래 있는 이미지가 된다.
    },
  });
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [photocards, setPhotocards] = useState([]);
  const [message, setMessage] = useState('');
  const imageRef = useRef(null);
  const request = useRequest();
  const navigate = useNavigate();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      let res = await request.call(api.getGroupList);
      setGroups(res.groups);
      if(requestId){
        res = await request.call(api.getVoucherRequestDetail, requestId);
        setForm(produce(draft => {
        draft.delivery = res.request.delivery;
        draft.trackingNumber = res.request.tracking_number;
        draft.groupId = res.request.group_id;
        draft.memberId = res.request.member_id;
        draft.photocardId = res.request.photocard_id;
        draft.image.previewURL = `${BACKEND}/image/voucher/${res.request.image_name}`;
        draft.image.initialURL = `${BACKEND}/image/voucher/${res.request.image_name}`;
        }));
      }
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }
  useEffect(() => { onLoad(); }, []);

  // 화면에 보여줄 포토카드 목록 업데이트
  const onUpdatePhotocards = async (e) => {
    if (form.groupId === '' || form.memberId === '') {
      setPhotocards([]);
      return;
    }

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

  // 이미지 업로드 초기화 클릭시
  const onClickImageReset = () => {
    imageRef.current.value = ''; // file 타입의 input 값 초기화
    setForm(produce(draft => {
      draft.image.file = ""; // 실제 이미지 파일 초기화
      draft.image.previewURL = form.image.initialURL; // 브라우저에 임시로 보여줄 이미지 URL 초기화
    }));
  }

  // 이미지 업로드 버튼 클릭시
  const onClickImageUpload = () => {
    imageRef.current.click(); // 숨겨져 있는 file 타입의 input 클릭 처리
  }

  // 이미지 파일 변경시
  const onChangeImage = (e) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];

    if (file) {
      reader.onloadend = () => {
        setForm(produce(draft => {
          draft.image.file = file; // 실제 이미지 파일 설정
          draft.image.previewURL = reader.result; // 브라우저에 임시로 보여줄 이미지 URL 설정
        }));
      };
      reader.readAsDataURL(file);
    }
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

    // 새로 작성하는 경우
    if (!requestId) {
      try {
        const res = await request.call(api.postVoucherRequest, form);
        console.log(res);
        return navigate('/mypage/voucher');
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
    // 수정하는 경우
    else{
      try {
        const res = await request.call(api.putVoucherRequest, form, requestId);
        console.log(res);
        setMessage(res.message);
        return navigate(-1);
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
  }

  return (
    <UserTemplate
      className="VoucherRequestWriterPage"
      sidebar={<MyPageSidebar />}
    >
      <form onSubmit={onSubmit}>
        {requestId ?
        <h1 className="title-label">포토카드 소유권 요청 수정</h1> :
        <h1 className="title-label">포토카드 소유권 요청 등록</h1>}

        {message ? <MessageLabel>{message}</MessageLabel> : null}

        <p className="label">실물 이미지</p>
        <section className="image_section">
          <img 
            width="200px"
            height="200px"
            src={form.image['previewURL']}
            onError={e => e.target.src = '/no_image.jpg'}
            alt="포토카드 실물"
          />
          <input type="file" accept=".jpg, .png" ref={imageRef} onChange={onChangeImage} />
          <section className="button_section">
            <Button className="cancel_button" onClick={onClickImageReset}>초기화</Button>
            <Button className="submit_button" onClick={onClickImageUpload}>업로드</Button>
          </section>
        </section>
        <p className="label">발송한 택배사</p>
        <Input
          type="text"
          name="delivery"
          value={form.delivery}
          autoComplete="off"
          placeholder="택배사를 입력하세요"
          onChange={onChangeInput}
        />
        <p className="label">운송장 번호</p>
        <Input
          type="text"
          name="trackingNumber"
          value={form.trackingNumber}
          autoComplete="off"
          placeholder="운송장 번호를 입력하세요"
          onChange={onChangeInput}
        />

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
          {requestId ? <Button className="submit_button" type="submit">수정</Button>:
          <Button className="submit_button" type="submit">작성</Button>}
        </section>
      </form>
    </UserTemplate>
  );
};

export default VoucherRequestWriterPage;