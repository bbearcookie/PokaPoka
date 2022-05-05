import React, { useEffect, useState } from 'react';
import './ChangeLetterListPage.scss';
import Button from '../../components/form/Button';
import Table from 'react-bootstrap/Table';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import {Link} from 'react-router-dom';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

const ChangeLetterListPage = () => {

const [users,setUsers]=useState([
    { 
        number: '1',
        divide: '1대1 교환',
        title:'지민 2018 서울콘 교환',
        day:'2022-05-18'
    },
    { 
        number: '2',
        divide: '다중 교환',
        title:'지민 화양연화 앨범 교환',
        day:'2022-05-18'
    },
    { 
        number: '3',
        divide: '1대1 교환',
        title:'지민 love yourself 앨범 교환',
        day:'2022-05-18'
    },
    { 
        number: '4',
        divide: '다중 교환',
        title:'지민 Butter 공방 교환',
        day:'2022-05-18'
    },
    { 
        number: '5',
        divide: '다중 교환',
        title:'지민 Dynamite 앨범 교환',
        day:'2022-05-18'
    }
]);
  
    return(
        <UserTemplate className="ChangeLetterListPage"
        sidebar={<MyPageSidebar/>}>
        
        <h1 className="h"> 교환글 관리</h1>
         <section className="changeletterlist">
            <form>
                <Link to="/mypage/changeletterwrite">
                    <Button className="r">글쓰기</Button>
                </Link>
                        <Table>
                        <tr className="title">
                            <td> 번호</td>
                            <td> 분류</td>
                            <td> 제목 </td>
                            <td> 등록일</td>
                            <td> 관리</td>
                        </tr>                    
                           {users && users.map((user) => 
                            <tr>
                                <td> {user.number}</td>
                                <td> {user.divide}</td>
                                <td> {user.title} </td>
                                <td> {user.day}</td>
                                <td>
                                    <Button className="bl">수정</Button>
                                    <Button className="o" >삭제</Button>
                                </td>
                        </tr>
                     )}                       
                    </Table>
            </form>
        </section>
   </UserTemplate>
    );
};

export default ChangeLetterListPage;