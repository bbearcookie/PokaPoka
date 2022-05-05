import React, { useEffect, useState } from 'react';
import './InfoManagePage.scss';
import Table from 'react-bootstrap/Table';
import Button from '../../components/form/Button';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import {Link} from 'react-router-dom';

const InfoManagePage = () => {
    const Users=[{
        id:'아이디',
       name:'이름',
   number:'전화번호',
   nickname:'닉네임',
   group:'최애그룹'}];
   


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
                <p>{Users[0].id}</p>
            </th>
        </tr>
        <tr>
            <th className="b">
                이름
            </th>
            <th>
            <p>{Users[0].name}</p>
            </th>
        </tr>
        <tr>
            <th className="b">
                전화번호
            </th>
            <th>
            <p>{Users[0].number}</p>
            </th>
        </tr>
        <tr>
            <th className="b">
                닉네임
            </th>
            <th>
            <p>{Users[0].nickname}</p>
            </th>
        </tr>
        <tr>
            <th className="b">
                최애그룹
            </th>
            <th>
            <p>{Users[0].group}</p>
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