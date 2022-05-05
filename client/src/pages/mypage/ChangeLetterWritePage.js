import React, { useEffect, useState } from 'react';
import Button from '../../components/form/Button';
import Table from 'react-bootstrap/Table';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
import './ChangeLetterWritePage.scss';
const selectList = ["1대1 교환","다중 교환"];


const ChangeLetterWritePage = () => {
    
const Users = [{
    title:'제목',
    writer:'작성자',
    day:'등록일'

}];
const [Selected, setSelected] = useState("");

const handleChangeSelect = (e) => {
  setSelected(e.target.value);
};



 
    return(
        
        <UserTemplate className="ChangeLetterWritePage"
        sidebar={<MyPageSidebar/>}>
        
    <h1 className="h">교환글 작성</h1>
    <section className="write_section">
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

<select className="divide" onChange={handleChangeSelect}>
  <option value="1"> 1대1 교환</option>
  <option value="2">다중 교환</option>
</select>

</td>
</tr>
</Table>
<form className="f1">
<h1 className="h">보유한 포토카드 소유권</h1>
<form className="f2">
<Button className="arrow" >다음</Button>
    </form>
<h1 className="h">교환할 포토카드 소유권</h1>
<form className="f3">
<Button className="arrow" >다음</Button>
</form>


</form>
<Button className="btn">등록</Button>
</form>
    </section>
    </UserTemplate>
    );
};

export default ChangeLetterWritePage;