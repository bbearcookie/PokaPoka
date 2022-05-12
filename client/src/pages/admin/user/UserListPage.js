import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import useRequest from '../../../utils/useRequest';
import * as api from '../../../utils/api';
import UserList from '../../../components/list/UserList';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Button from '../../../components/form/Button';
import Select from '../../../components/form/Select';
import Input from '../../../components/form/Input';
import AdminTemplate from '../../../templates/AdminTemplate';
import { setSelect, setUsers } from '../../../modules/UserListPage';
import produce from 'immer';
import './UserListPage.scss';

// 사용자 목록 조회 페이지
const UserListPage = () => {
  // 리덕스 스토어에 저장한 상태값. 페이지 이동시에도 상태를 보관해두기 위함.
  const { select, users } = useSelector(state => ({
    select: state.UserListPage.select,
    users: state.UserListPage.users
  }));
  const dispatch = useDispatch(); // 리듀서 액션 함수를 작동시키는 함수
  const request = useRequest();
  //const [user, setUser] = useState([]);
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  //select에 들어갈 내용
  const [form, setForm] = useState({
    keword: '',
    username: ''
  });

  //화면 로드시 작동
  const onLoad = async (e) => {
    try {
      // const res = await request.call(api.getUserList);
      // console.log(res.users);
      // dispatch(setUsers(res.users));
      // console.log(res.users);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  // 화면에 보여줄 사용자 목록 업데이트
  const onUpdateUsers = async () => {
    try {
      const res = await request.call(api.getUserListAll, {
        username: select.username
      });
      dispatch(setUsers(res.users));
      console.log(res.users);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };
  useEffect(() => { onUpdateUsers(); }, [select]);

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

   // Select 선택 변경시 동작
   const onChangeSelect = async (e) => {
    const name = e.target.name;
    const value = e.target.value;

    dispatch(setSelect({ ...select, [name]: value }));
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
          <p className="label">작성자</p>
          <Input
            type="text"
            name="username"
            value={select.username}
            autoComplete="off"
            placeholder="전체"
            onChange={onChangeSelect}
          />
        </article>
      </section>
      
      <section>
        <UserList users={users} perPage="10" />
      </section>

    </AdminTemplate>
  );
};

export default UserListPage;