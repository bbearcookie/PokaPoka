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

    const [users,setUsers]=useState([
    {   
        title:'닉네임 변경은 어떻게 하나요?',
        writer:'user01',
        day:'2022-05-10',
        content:'안녕하세요 BTS최애인 아미인데요 이거 설정에서 닉네임은 한번 정하면 못바꾸나요?? 여기서 어디를 들어가야 하는지 모르겠어요 ㅠㅠㅠ'
    }
    ])

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
                            value={users.title}
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
                            name="content"
                            placeholder=""
                            value={users.content}
                            autoComplete="off"/>
                    </form>

                    <Button className="btn">등록</Button>

                </form>
            </section>
   

    </UserTemplate>
    );
};

export default AskingPage;