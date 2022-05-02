import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import produce from 'immer';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { BACKEND } from '../../../utils/api';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import Button from '../../../components/form/Button';
import Input from '../../../components/form/Input';
import Select from '../../../components/form/Select';
import AdminTemplate from '../../../templates/AdminTemplate';
import './PhotocardWriterPage.scss';

const PhotocardWriterPage = () => {
  const { photocardId } = useParams(); // URL에 포함된 photocardId Params 정보
  const [form, setForm] = useState({
    name: '',
    group: {
      id: '',
      previewURL: '', // 브라우저에 임시로 보여줄 이미지 URL
    },
    member: {
      id: '',
      previewURL: '',
    },
    album: {
      id: '',
      previewURL: '',
    },
    image: {
      file: '', // 업로드 된 실제 이미지 파일
      previewURL: '', // 브라우저에 임시로 보여줄 이미지 URL
      initialURL: '', // 브라우저에 보여줄 초기 이미지 URL. 작성시에는 빈 값이고 수정시에는 원래 있는 이미지가 된다.
    }
  });
  const [groups, setGroups] = useState([]); // Select 태그에서 사용할 그룹 목록
  const [members, setMembers] = useState([]); // Select 태그에서 사용할 멤버 목록
  const [albums, setAlbums] = useState([]); // Select 태그에서 사용할 앨범 목록
  const [message, setMessage] = useState('');
  const imageRef = useRef();
  const request = useRequest();
  const navigate = useNavigate();

  // 페이지 로드시 동작
  const onLoad = async () => {

    // 기존의 포토카드 내용을 수정하려는 경우 기본 폼의 내용을 서버로부터 가져옴
    if (photocardId) {
      try {
        // 기본 폼 내용 가져옴
        const res = await request.call(api.getAdminPhotocardDetail, photocardId);
        setForm(produce(draft => {
          draft.name = res.photocard.name;
          draft.group = {
            id: res.photocard.group_id,
            previewURL: res.group.image_name
          };
          draft.member = {
            id: res.photocard.member_id,
            previewURL: res.member.image_name
          };
          draft.album = {
            id: res.photocard.album_id,
            previewURL: res.album.image_name
          };
          draft.image.previewURL = `${BACKEND}/image/photocard/${res.photocard.image_name}`;
          draft.image.initialURL = `${BACKEND}/image/photocard/${res.photocard.image_name}`;
        }));

        // select 태그에 보여줄 멤버와 앨범 목록 가져옴
        let res2 = await request.call(api.getAdminMemberList, res.photocard.group_id);
        setMembers(res2.members);
        res2 = await request.call(api.getAdminAlbumList, res.photocard.group_id);
        setAlbums(res2.albums);
      } catch (err) {
        console.error(err);
        setMessage(err.response.data.message);
      }
    }

    // 존재하는 모든 그룹 목록 가져옴
    try {
      const res = await request.call(api.getAdminGroupList);
      setGroups(res.groups);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }
  useEffect(() => { onLoad(); }, []);

  // input 값 변경시 동작
  const onChangeInput = (e) => {
    setForm(produce(draft => {
      draft[e.target.name] = e.target.value;
    }));
  }

  // 그룹 선택 변경시 동작
  const onChangeGroupSelect = async (e) => {
    setForm(produce(draft => {
      draft.group.id = e.target.value;
      draft.member.id = "";
      draft.member.previewURL = "";
      draft.album.id = "";
      draft.album.previewURL = "";
    }));

    // 선택 option을 눌러서 초기화 됬을 때
    if (e.target.value === '') {
      setMembers([]);
      setAlbums([]);
      setForm(produce(draft => {
        draft.group.previewURL = "";
        draft.album.previewURL = "";
      }));
    // 특정 그룹을 선택했을 때
    } else {
      try {
        let res = await request.call(api.getAdminMemberList, e.target.value);
        setMembers(res.members);
        res = await request.call(api.getAdminAlbumList, e.target.value);
        setAlbums(res.albums);
        setForm(produce(draft => {
          draft.group.previewURL = groups.find(group => group.group_id === parseInt(e.target.value)).image_name;
        }));
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
  }

  // 멤버 선택 변경시 동작
  const onChangeMemberSelect = async (e) => {
    setForm(produce(draft => {
      draft.member.id = e.target.value;
    }));

    // 선택 option을 눌러서 초기화 됬을 때
    if (e.target.value === '') {
      setForm(produce(draft => {
        draft.member.previewURL = "";
      }));
    // 특정 멤버를 선택했을 때
    } else {
      setForm(produce(draft => {
        draft.member.previewURL = members.find(member => member.member_id === parseInt(e.target.value)).image_name;
      }));
    }
  }

  // 앨범 선택 변경시 동작
  const onChangeAlbumSelect = async (e) => {
    setForm(produce(draft => {
      draft.album.id = e.target.value;
    }));

    // 선택 option을 눌러서 초기화 됬을 때
    if (e.target.value === '') {
      setForm(produce(draft => {
        draft.album.previewURL = "";
      }));
    // 특정 앨범을 선택했을 때
    } else {
      setForm(produce(draft => {
        draft.album.previewURL = albums.find(album => album.album_id === parseInt(e.target.value)).image_name;
      }));
    }
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

  // 작성 취소 버튼 클릭시
  const onCancel = () => navigate(-1); // 뒤로 돌아가기

  // 작성 버튼 클릭시 작동
  const onSubmit = async (e) => {
    e.preventDefault();

    // 새로 작성하는 경우
    if (!photocardId) {
      try {
        const res = await request.call(api.postAdminPhotocard, form);
        setMessage(res.message);
      } catch (err) {
        setMessage(err.response.data.message);
      }
    // 내용을 수정하는 경우
    } else {
      try {
        console.log(form);
        const res = await request.call(api.putAdminPhotocard, form, photocardId);
        setMessage(res.message);
        // return navigate(`/admin/photocard/detail/${photocardId}`);
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
  }

  return (
    <AdminTemplate className="AdminPhotocardWriterPage">
    {request.loading ? <LoadingSpinner /> : null}
      <form onSubmit={onSubmit}>
        {photocardId ?
        <h1 className="title-label">포토카드 수정</h1> :
        <h1 className="title-label">포토카드 추가</h1>}

        {message ? <MessageLabel>{message}</MessageLabel> : null}

        <p className="label">포토카드 이미지</p>
        <section className="image_section">
          <img 
              width="200px"
              height="200px"
              src={form.image['previewURL']}
              onError={e => e.target.src = '/no_image.jpg'}
              alt="그룹"
          />
          <input type="file" accept=".jpg, .png" ref={imageRef} onChange={onChangeImage} />
          <section className="button_section">
            <Button className="cancel_button" onClick={onClickImageReset}>초기화</Button>
            <Button className="submit_button" onClick={onClickImageUpload}>업로드</Button>
          </section>
        </section>
        
        <p className="label">이름</p>
        <Input
          type="text"
          name="name"
          value={form.name}
          autoComplete="off"
          placeholder="이름을 입력하세요"
          onChange={onChangeInput}
        />

        <p className="label">그룹</p>
        <Select name="group" value={form.group.id} onChange={onChangeGroupSelect}>
          <option value="">선택</option>
          {groups ?
          groups.map(group =>
            <option key={group.group_id} value={group.group_id}>{group.name}</option>
          ) : null}
        </Select>
        {form.group.previewURL ?
          <img 
            width="200px"
            height="200px"
            src={`${BACKEND}/image/group/${form.group.previewURL}`}
            onError={e => e.target.src = '/no_image.jpg'}
            alt="그룹"
          />
        : null}

        <p className="label">멤버</p>
        <Select name="member" value={form.member.id}  onChange={onChangeMemberSelect}>
          <option value="">선택</option>
          {members ?
          members.map(member =>
            <option key={member.member_id} value={member.member_id}>{member.name}</option>
          ) : null}
        </Select>
        {form.member.previewURL ?
          <img 
            width="200px"
            height="200px"
            src={`${BACKEND}/image/member/${form.member.previewURL}`}
            onError={e => e.target.src = '/no_image.jpg'}
            alt="멤버"
          />
        : null}

        <p className="label">앨범</p>
        <Select name="album"value={form.album.id} onChange={onChangeAlbumSelect}>
          <option value="">선택</option>
          {albums ?
          albums.map(album =>
            <option key={album.album_id} value={album.album_id}>{album.name}</option>
          ) : null}
        </Select>
        {form.album.previewURL ?
          <img 
            width="200px"
            height="200px"
            src={`${BACKEND}/image/album/${form.album.previewURL}`}
            onError={e => e.target.src = '/no_image.jpg'}
            alt="앨범"
          />
        : null}

        <section className="submit_section">
          <Button className="cancel_button" type="button" onClick={onCancel}>취소</Button>
          <Button className="submit_button" type="submit">작성</Button>
        </section>
      </form>
    </AdminTemplate>
  );
};

export default PhotocardWriterPage;