import { createAction, handleActions } from 'redux-actions';

// 초기 상태 지정
const initialState = {
  select: {
    searchType: '',
    state: '', // 조회할 교환글 진행중 or 완료 상태
    groupId: '',
    memberId: '',
    albumId: '',
    username: '' // 작성자 필터링
  },
  groups: [], // Select 태그에 보여줄 그룹 목록
  members: [], // Select 태그에 보여줄 멤버 목록
  albums: [], // Select 태그에 보여줄 앨범 목록
  trades: [], // 화면에 보여줄 교환글 목록
}

// 액션 타입 정의
const SET_SELECT = 'photocardListPage/SET_SELECT';
const SET_GROUPS = 'photocardListPage/SET_GROUPS';
const SET_MEMBERS = 'photocardListPage/SET_MEMBERS';
const SET_ALBUMS = 'photocardListPage/SET_ALBUMS';
const SET_TRADES = 'photocardListPage/SET_TRADES';

// 액션 생성 함수 생성 (state 값 변경하는 함수)
export const setSelect = createAction(SET_SELECT, select => select);
export const setGroups = createAction(SET_GROUPS, groups => groups);
export const setMembers = createAction(SET_MEMBERS, members => members);
export const setAlbums = createAction(SET_ALBUMS, albums => albums);
export const setTrades = createAction(SET_TRADES, trades => trades);

// 각 액션에 대한 업데이트 함수 정의
export default handleActions({
  [SET_SELECT]: (state, { payload: select }) => ({ ...state, select }),
  [SET_GROUPS]: (state, { payload: groups }) => ({ ...state, groups }),
  [SET_MEMBERS]: (state, { payload: members }) => ({ ...state, members }),
  [SET_ALBUMS]: (state, { payload: albums }) => ({ ...state, albums }),
  [SET_TRADES]: (state, { payload: trades }) => ({ ...state, trades })
}, initialState);