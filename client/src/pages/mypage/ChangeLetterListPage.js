import React, { useEffect, useState } from 'react';
import './ChangeLetterListPage.scss';
import Button from '../../components/form/Button';
import Table from 'react-bootstrap/Table';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import {Link} from 'react-router-dom';
import { faUsers } from '@fortawesome/free-solid-svg-icons';

const ChangeLetterListPage = () => {
    const users = [
        {
          number: '번호',
          divide: '분류',
          title:'제목',
          day:'등록일'
        }]
  
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
                        <tr>
                            <td> {users[0].number}</td>
                            <td className="b"> {users[0].divide}</td>
                            <td> {users[0].title}</td>
                            <td> {users[0].day}</td>
                            <td> <Button className="bl">수정</Button><Button className="o" >삭제</Button></td>
                        </tr>
                        <tr>
                            <td> {users[0].number}</td>
                            <td className="y"> {users[0].divide}</td>
                            <td> {users[0].title} </td>
                            <td> {users[0].day}</td>
                            <td> <Button className="bl">수정</Button><Button className="o">삭제</Button></td>
                        </tr>
                        <tr>
                            <td> {users[0].number}</td>
                            <td className="b"> {users[0].divide}</td>
                            <td> {users[0].title}</td>
                            <td> {users[0].day}</td>
                            <td> <Button className="bl">수정</Button><Button className="o">삭제</Button></td>
                        </tr>
                        <tr>
                            <td> {users[0].number}</td>
                            <td className="y">{users[0].divide}</td>
                            <td>  {users[0].title}</td>
                            <td>{users[0].day}</td>
                            <td> <Button className="bl">수정</Button><Button className="o">삭제</Button></td>
                        </tr>
                        <tr>
                            <td> {users[0].number}</td>
                            <td className="y"> {users[0].divide}</td>
                            <td> {users[0].title}</td>
                            <td> {users[0].day}</td>
                            <td> <Button className="bl">수정</Button><Button className="o">삭제</Button></td>
                        </tr>
                    </Table>
            </form>
        </section>
   </UserTemplate>
    );
};

export default ChangeLetterListPage;