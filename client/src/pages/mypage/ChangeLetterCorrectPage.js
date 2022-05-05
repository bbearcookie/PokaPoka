import React, { useEffect, useState } from 'react';
import Button from '../../components/form/Button';
import Table from 'react-bootstrap/Table';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import './ChangeLetterCorrectPage.scss';

const ChangeLetterCorrectPage = () =>{

const[users,setUsers]=useState([
{
    writer:'BYSFOREVER',
    day:'2022-05-18'
}
]);

    return(
        
        <UserTemplate className="ChangeLetterCorrectPage"
        sidebar={<MyPageSidebar/>}>
        
            <h1 className="h">교환글 작성</h1>
            <section className="correct_section">
                <form>
                    <Table>
                        <tr>
                            <td className="title">제목</td>
                            <td className="title"><input type="text"
                            name="title"
                            placeholder=""
                            autoComplete="off"/></td>
                        </tr>
                        <tr>
                            <td>작성자</td>
                            <td> {users.writer} </td>
                        </tr>
                        <tr>
                            <td>등록일</td>
                            <td>{users.day}</td>
                        </tr>
                        <tr>
                            <td>분류</td>
                            <td>
                                {users.divide}
                        </td>
                        </tr>
                    </Table>    
                    <form className="f1">
                        <h1 className="h">보유한 포토카드 소유권</h1>
                        <h1 className="h">교환할 포토카드 소유권</h1>

                    </form>
                    <Button className="btn">등록</Button>

                </form>

      </section>
    </UserTemplate>
    );
};

export default ChangeLetterCorrectPage;