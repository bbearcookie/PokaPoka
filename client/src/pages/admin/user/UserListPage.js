import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import UserList from '../../../components/list/UserList';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/form/Button';
import Select from '../../../components/form/Select';
import Input from '../../../components/form/Input';
import AdminTemplate from '../../../templates/AdminTemplate';
import produce from 'immer';
import './UserListPage.scss';

// 테스트용 더미 데이터 생성 (테스트용 함수임)
const createDummyList = () => {
  const list = [];

  for (let i = 0; i < 202; i++) {
    list.push({
      id: i,
      username: 'user',
      name: 'testman',
      phone: '1',
      nickname: `${i}번째 게시글`,
      favorite: 'BTS'
    });
  }


  return list;
}

// 사용자 목록 조회 페이지
const UserListPage = () => {
  const request = useRequest();
  const [user, setUser] = useState([]);
  const navigate = useNavigate();

  //select에 들어갈 내용
  const [form, setForm] = useState({
    keword: '',
    username: ''
  });

  // 화면 로드시 작동
  const onLoad = async (e) => {
    try {
      const res = await request.call(api.getUserList);
      console.log(res.user);
      setUser(res.user);
      //setUser(createDummyList()); // 페이지네이션 기능 테스트를 위한 더미 데이터
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  // input 값 변경시
  const onChangeInput = async (e) => {
    console.log("value: "+e.target.value);
    if(e.target.value === 'withdrawal') navigate('/admin/user/withdrawal');
    if(e.target.value === 'inactive') navigate('/admin/user/inactive');
  }

  // input 값 변경시
  const onChange = (e) => {
    setForm(produce(draft => {
      draft[e.target.name] = e.target.value;
    }));
  }

  // 검색 버튼 클릭시
  const onClickSearch = async (e) => {
    if(form.username) navigate(`/admin/user/search/${form.username}`);
  }

  return (
    <AdminTemplate className="UserListPage">
      {request.loading ? <LoadingSpinner /> : null}
      <section className="title_area">
        <h1 className="title-label">사용자 목록</h1>
      </section>
      <section className="search_area">
        <article className="search">
          <p className="label">선택</p>
          <Select name="keword" value={form.keword} onChange={onChangeInput}>
            <option value="default">전체</option>
            <option value="withdrawal">탈퇴 요청한 사용자</option>
            <option value="inactive">비활성화된 사용자</option>
          </Select>
        </article>
        <article className="search">
          <p className="label">아이디 검색</p>
          <Input
            type="text"
            name="username"
            value={form.username}
            autoComplete="off"
            placeholder="아이디를 입력하세요"
            onChange={onChange}
          />
        </article>
        <Button className="search_button" onClick={onClickSearch}>검색</Button>
      </section>
      <section>
        <UserList users={user} perPage="10" />
      </section>

    </AdminTemplate>
  );
};

export default UserListPage;