import React, { useEffect, useState } from 'react';
import './InfoManagePage.scss';
import Table from 'react-bootstrap/Table';
import Button from '../../components/form/Button';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import {Link} from 'react-router-dom';

const InfoManagePage = () => {
    const [users,setUsers]=([
     {
        id:'user01',
        name:'홍길동',
        number:'01012345678',
        nickname:'BTSFOREVER',
        group:'BTS'}
   ]);
   


    return(
        <UserTemplate className="InfoManagePage"
        sidebar={<MyPageSidebar/>}>
        
            <h1 className="h">회원정보 관리</h1>
                <section className="InfoManage_sec">
                    <form>
                    <Table>
                        <tr>
                            <th className="b">
                                아이디
                            </th>
                            <th>
                                <p>{users.id}</p>
                            </th>
                        </tr>
                        <tr>
                            <th className="b">
                                이름
                            </th>
                            <th>
                                <p>{users.name}</p>
                            </th>
                        </tr>
                        <tr>
                            <th className="b">
                                전화번호
                            </th>
                            <th>
                                <p>{users.number}</p>
                            </th>
                        </tr>
                        <tr>
                            <th className="b">
                                닉네임
                            </th>
                            <th>
                                <p>{users.nickname}</p>
                            </th>
                        </tr>
                        <tr>
                            <th className="b">
                                최애그룹
                            </th>
                            <th>
                                <p>{users.group}</p>
                            </th>
                        </tr>
                    </Table>
                        <Link to="/mypage/infocorrect">
                            <Button className="btn" submit="submit" >수정</Button>
                        </Link>
                    </form>
            </section>

    </UserTemplate>
    );
};

export default InfoManagePage;