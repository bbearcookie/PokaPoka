import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import produce from 'immer';
import qs from 'qs';
import AdminTemplate from '../../../templates/AdminTemplate';
import LoadingSpinner from '../../../components/LoadingSpinner';
import MessageLabel from '../../../components/MessageLabel';
import Button from '../../../components/form/Button';
import Input from '../../../components/form/Input';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import { BACKEND } from '../../../utils/api';
import './AlbumWriterPage.scss';

const AlbumWriterPage = () => {
  const { groupId } = qs.parse(window.location.search, { ignoreQueryPrefix: true }); // 앨범이 소속된 그룹 ID
  const { albumId } = useParams(); // URL에 포함된 albumId Params 정보
  const [form, setForm] = useState({
    name: '',
    image: {
      file: '', // 업로드 된 실제 이미지 파일
      previewURL: '', // 브라우저에 임시로 보여줄 이미지 URL
      initialURL: '', // 브라우저에 보여줄 초기 이미지 URL. 작성시에는 빈 값이고 수정시에는 원래 있는 이미지가 된다.
    }
  });
  const [message, setMessage] = useState('');
  const imageRef = useRef(null);
  const request = useRequest();
  const navigate = useNavigate();

  // 화면 로드시 동작
  const onLoad = async () => {
    // 기존의 앨범 내용을 수정하려는 경우 기본 폼의 내용을 서버로부터 가져옴
    if (albumId) {
      try {
        const res = await request.call(api.getAdminAlbumDetail, albumId);
        setForm(produce(draft => {
          draft.name = res.album.name;
          draft.image.previewURL = `${BACKEND}/image/album/${res.album.image_name}`;
          draft.image.initialURL = `${BACKEND}/image/album/${res.album.image_name}`;
        }));
      } catch (err) {
        console.error(err);
      }
    }
  };
  useEffect(() => { onLoad(); }, []);

  // input 값 변경시
  const onChangeInput = (e) => {
    setForm(produce(draft => {
      draft[e.target.name] = e.target.value;
    }));
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

  // 작성 버튼 클릭시
  const onSubmit = async (e) => {
    e.preventDefault();
    console.log(form);

    // 새로 작성하는 경우
    if (!albumId) {
      try {
        const res = await request.call(api.postAdminAlbum, form, groupId);
        setMessage(res.message);
        return navigate(`/admin/group/detail/${groupId}`);
      } catch (err) {
        setMessage(err.response.data.message);
      }
    // 내용을 수정하는 경우
    } else {
      try {
        const res = await request.call(api.putAdminAlbum, form, albumId);
        setMessage(res.message);
        return navigate(`/admin/album/detail/${albumId}?groupId=${groupId}`);
      } catch (err) {
        setMessage(err.response.data.message);
      }
    }
  }

  return (
    <AdminTemplate className="AdminAlbumWriterPage">
      {request.loading ? <LoadingSpinner /> : null}
      <form onSubmit={onSubmit}>
        {albumId ?
        <h1 className="title-label">앨범 수정</h1> :
        <h1 className="title-label">앨범 추가</h1>}

        {message ? <MessageLabel>{message}</MessageLabel> : null}

        <p className="label">앨범 이미지</p>
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
        <section className="submit_section">
          <Button className="cancel_button" type="button" onClick={onCancel}>취소</Button>
          <Button className="submit_button" type="submit">작성</Button>
        </section>
      </form>
    </AdminTemplate>
  );
};

export default AlbumWriterPage;