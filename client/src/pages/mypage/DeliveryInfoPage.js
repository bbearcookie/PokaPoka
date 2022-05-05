import React, { useEffect, useState } from 'react';
import './DeliveryInfoPage.scss';
import Button from '../../components/form/Button';
import MyPageSidebar from '../../components/sidebar/MyPageSidebar';
import UserTemplate from '../../templates/UserTemplate';
const DeliveryInfoPage = () => {
   
    const [users,setUsers]=([
    {   
        name:'홍길동',
        number:'010-1234-5678',
        address:'경기도 구리시 검배로 142 205동 207호'
    }
    ]);

    return(
        <UserTemplate className="DeliveryInfoPage"
        sidebar={<MyPageSidebar/>}>
        
            <h1 className="h">배송정보 관리</h1>
                <section className="delivery">
                    <form>
                        <h1>{users.name}</h1>
                        <h1>{users.number}</h1>
                        <h1>{users.address}</h1>
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