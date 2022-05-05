import React, { useEffect, useState } from 'react';
import './DeliveryInfoPage.scss';
import Button from '../../components/form/Button';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
const DeliveryInfoPage = () => {
   
const Users=[{name:'이름',
number:'번호',
address:'주소'
}];

    return(
        <UserTemplate className="DeliveryInfoPage"
        sidebar={<MyPageSidebar/>}>
        
    <h1 className="h">배송정보 관리</h1>
    <section className="delivery">
        <form>
            <h1>{Users[0].name}</h1>
            <h1>{Users[0].number}</h1>
            <h1>{Users[0].address}</h1>
            <Button className="btn" >삭제하기</Button>
            
        </form>
        </section>
        <section className="delivery1">
        
        <Button className="btn" >배송정보 추가하기</Button>
        
        </section>

    </UserTemplate>
    );
};

export default DeliveryInfoPage;