import React, { useEffect, useState } from 'react';
import './AskingPage.scss';
import Button from '../../components/form/Button';
import Table from 'react-bootstrap/Table';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';

const selectList = ["일반", "교환", "계정", "배송"];


const AskingPage = () => {
    
const [Selected, setSelected] = useState("");

const handleChangeSelect = (e) => {
  setSelected(e.target.value);
};
const Users=[{
    title:'제목',
writer:'작성자',
day:'등록일',
divide:'분류',
content:'내용'}];

    return(
        
        <UserTemplate className="AskingPage"
        sidebar={<MyPageSidebar/>}>
        
    <h1 className="h">문의하기</h1>
    <section className="asking_section">
<form>
<Table>
<tr>
    <td className="title">제목</td>
    <td className="title"><input type="text"
    name="title"
    placeholder=""
    value={Users[0].title}
    autoComplete="off"/></td>
</tr>
<tr>
<td>작성자</td>
<td> {Users[0].writer} </td>
</tr>
<tr>
    <td>등록일</td>
    <td>{Users[0].day}</td>
</tr>
<tr>
    <td>분류</td>
    <td>

<select onChange={handleChangeSelect}>
  <option value="1"> 일반</option>
  <option value="2">교환</option>
  <option value="3">계정</option>
  <option value="4">배송</option> 
</select>

</td>
</tr>
<tr >
    <td>첨부파일</td>
    <td><Button className="b">첨부하기</Button></td>
</tr>

</Table>

<form className="f">
<input type="text"
    name="divide"
    placeholder=""
    value={Users[0].divide}
    autoComplete="off"/>
</form>

<Button className="btn">등록</Button>

</form>
    </section>
   

    </UserTemplate>
    );
};

export default AskingPage;