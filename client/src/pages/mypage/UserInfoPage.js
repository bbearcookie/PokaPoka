import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from '../../components/form/Button';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import {Link} from 'react-router-dom';
import * as api from '../../utils/api';
import useRequest from '../../utils/useRequest';
import LoadingSpinner from '../../components/LoadingSpinner';
import './UserInfoPage.scss';

const UserInfoPage = () => {
    const request = useRequest();
    const navigate = useNavigate();
    const [users,setUsers]=useState({
        username: '',
        name: '',
        phone: '',
        nickname: '',
        favorite: ''
    });

    // 페이지 로드시 동작
    const onLoad = async () => {
    try {
      //회원 정보 가져오기
      let res = await request.call(api.getUserInfo);
      if(!res.user.favorite) res.user.favorite = '없음';
      setUsers({
        username: res.user.username,
        name: res.user.name,
        phone: res.user.phone,
        nickname: res.user.nickname,
        favorite: res.user.favorite});
    } catch (err) {
      console.error(err);
    }};
    useEffect(() => { onLoad(); }, []);

    return(
        <UserTemplate className="UserInfoPage" sidebar={<MyPageSidebar/>}>
            {/* 데이터 로딩시 화면에 로딩 스피너 보여줌 */}
            {request.loading ? <LoadingSpinner /> : null}
            <h1 className="title-label">회원정보 관리</h1>
            <section className="InfoManage_sec">
                <form>
                    <Table>
                        <tr>
                            <th className="b">아이디</th>
                            <th><p>{users.username}</p></th>
                        </tr>
                        <tr>
                            <th className="b">이름</th>
                            <th><p>{users.name}</p></th>
                        </tr>
                        <tr>
                            <th className="b">전화번호</th>
                            <th><p>{users.phone}</p></th>
                        </tr>
                        <tr>
                            <th className="b">닉네임</th>
                            <th><p>{users.nickname}</p></th>
                        </tr>
                        <tr>
                            <th className="b"> 최애그룹</th>
                            <th><p>{users.favorite}</p></th>
                        </tr>
                    </Table>
                    <Link to="/mypage/editUserInfo"><Button className="btn" submit="submit" >수정</Button></Link>
                </form>
            </section>
        </UserTemplate>
    );
};

export default UserInfoPage;