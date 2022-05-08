import React, { useState, useEffect } from 'react';
import produce from 'immer';
import { Link } from 'react-router-dom';
import useRequest from '../../utils/useRequest';
import * as api from '../../utils/api';
import Button from '../../components/form/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Select from '../../components/form/Select';
import MessageLabel from '../../components/MessageLabel';
import TradeSideBar from '../../components/sidebar/TradeSideBar';
import UserTemplate from '../../templates/UserTemplate';
import './TradeListPage.scss';

const TradeListPage = () => {
  const [select, setSelect] = useState({
    searchType: '',
    groupId: '',
    memberId: '',
    albumId: ''
  });
  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [message, setMessage] = useState('');
  const [trades, setTrades] = useState([]);
  const request = useRequest();

  // 페이지 로드시 동작
  const onLoad = async () => {
    try {
      const res = await request.call(api.getGroupList);
      setGroups(res.groups);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  }
  useEffect(() => { onLoad(); }, []);

  // 화면에 보여줄 교환글 목록 업데이트
  const onUpdateTrades = async () => {
    if (select.searchType === '') {
      return setTrades([]);
    } else if (select.searchType === 'group') {
      if (select.groupId === '') return setTrades([]);
    } else if (select.searchType === 'member') {
      if (select.groupId === '' || select.memberId === '') return setTrades([]);
    } else if (select.searchType === 'album') {
      if (select.groupId === '' || select.albumId === '') return setTrades([]);
    }

    try {
      const res = await request.call(api.getTradeListAll, {
        groupId: select.groupId,
        memberId: select.memberId,
        albumId: select.albumId
      });
      setTrades(res.trades);
      console.log(res);
    } catch (err) {
      setMessage(err.response.data.message);
    }
  };
  useEffect(() => { onUpdateTrades(); }, [select]);

  // Select 선택 변경시 동작
  const onChangeSelect = async (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setSelect(produce(draft => {
      draft[name] = value;
    }));

    // 필터링 조건이 눌린 경우 조건에 따라 초기값 설정
    if (name === 'searchType') {
      if (value === '' || value === 'all') {
        setSelect(produce(draft => {
          draft.groupId = "";
          draft.memberId = "";
          draft.albumId = "";
        }));
      } else if (value === 'group') {
        setSelect(produce(draft => {
          draft.memberId = "";
          draft.albumId = "";
        }));
      } else if (value === 'member') {
        setSelect(produce(draft => { draft.albumId = ""; }));
      } else if (value === 'album') {
        setSelect(produce(draft => { draft.memberId = ""; }));
      }
    }
  }

  // 그룹 선택 변경시 동작
  const onChangeGroupSelect = async (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setSelect(produce(draft => {
      draft[name] = value;
    }));

    try {
      if (value === '') {
        setMembers([]);
        setAlbums([]);
      } else if (value === 'all') {
        const res = await request.call(api.getAllMemberList);
        const res2 = await request.call(api.getAllAlbumList);
        setMembers(res.members);
        setAlbums(res2.albums);
      } else {
        const res = await request.call(api.getMemberList, value);
        const res2 = await request.call(api.getAlbumList, value);
        setMembers(res.members);
        setAlbums(res2.albums);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response.data.message);
    }
  }

  return (
    <UserTemplate
      className="TradeListPage"
      sidebar={<TradeSideBar />}
    >
      {message ? <MessageLabel>{message}</MessageLabel> : null}
      <section className="title_area">
        <h1 className="title-label">교환글 목록</h1>
        <Link to="/trade/writer">
          <Button className="add_button">작성</Button>
        </Link>
      </section>
      <section className="search_area">

        <article className="search">
          <p className="label">필터링 조건</p>
          <Select name="searchType" value={select.searchType} onChange={onChangeSelect}>
            <option value="">선택</option>
            <option value="all">전체</option>
            <option value="group">그룹별</option>
            <option value="member">멤버별</option>
            <option value="album">앨범별</option>
          </Select>
        </article>

        {/* 필터링 조건이 있으면 그룹 선택 select를 화면에 보여줌 */}
        {['group', 'member', 'album'].includes(select.searchType) && 
        <article className="search">
          <p className="label">그룹</p>
          <Select name="groupId" value={select.groupId} onChange={onChangeGroupSelect}>
            <option value="">선택</option>
            <option value="all">전체</option>
            {groups ?
              groups.map(group => 
                <option key={group.group_id} value={group.group_id}>{group.name}</option>
              ) : null}
          </Select>
        </article>
        }

        {/* 필터링 조건이 member이면 멤버 선택 select를 화면에 보여줌 */}
        {select.searchType === 'member' &&
        <article className="search">
          <p className="label">멤버</p>
          <Select name="memberId" value={select.memberId} onChange={onChangeSelect}>
            <option value="">선택</option>
            <option value="all">전체</option>
            {members ?
              members.map(member => 
                <option key={member.member_id} value={member.member_id}>{member.name}</option>
              ) : null}
          </Select>
        </article>
        }

        {/* 필터링 조건이 album이면 앨범 선택 select를 화면에 보여줌 */}
        {select.searchType === 'album' &&
        <article className="search">
          <p className="label">앨범</p>
          <Select name="albumId" value={select.albumId} onChange={onChangeSelect}>
            <option value="">선택</option>
            <option value="all">전체</option>
            {albums ?
              albums.map(album => 
                <option key={album.album_id} value={album.album_id}>{album.name}</option>
              ) : null}
          </Select>
        </article>
        }
      </section>
    </UserTemplate>
  );
};

export default TradeListPage;