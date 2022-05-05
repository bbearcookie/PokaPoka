import React, { useEffect, useState } from 'react';
import './InfoCorrectPage.scss';
import Table from 'react-bootstrap/Table';
import Button from '../../components/form/Button';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
const InfoCorrectPage = () => {



   

    return(
        <UserTemplate className="InfoCorrectPage"
        sidebar={<MyPageSidebar/>}>
        
            <h1 className="h">회원정보 수정</h1>
        <section className="infocorrect_sec">
            <form>
                <Table>
                    <tr>
                        <td className="b">
                            아이디
                        </td>
                        <td>
                            <input type="text"
                        name="username"
                        placeholder=""
                        autoComplete="off" />
                        </td>
                    </tr>
                    <tr>
                        <td className="b">
                            이름
                        </td>
                        <td><input type="text"
                        name="name"
                        placeholder=""
                        autoComplete="off"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="b">
                            전화번호
                        </td>
                        <td>
                        <input type="text"
                        name="number"
                        placeholder=""
                        autoComplete="off"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="b">
                            닉네임
                        </td>
                        <td>
                        <input type="text"
                        name="nickname"
                        placeholder=""
                        autoComplete="off"/>
                        </td>
                    </tr>
                    <tr>
                        <td className="b">
                            최애그룹
                        </td>
                        <td>
                        <input type="text"
                        name="group"
                        placeholder=""
                        autoComplete="off"/>
                        </td>
                    </tr>
                </Table>
            <Button className="btn" submit="submit" >완료</Button>
            </form>
        </section>

    </UserTemplate>
    );
};

export default InfoCorrectPage;