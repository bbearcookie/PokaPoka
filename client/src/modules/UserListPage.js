import { createAction, handleActions } from 'redux-actions';

// 초기 상태 지정
const initialState = {
  select: {
    searchType: '',
    username: '' // 작성자 필터링
  },
  users: [], // 화면에 보여줄 사용자 목록
}

// 액션 타입 정의
const SET_SELECT = 'UserListPage/SET_SELECT';
const SET_USERS = 'UserListPage/SET_USERS';

// 액션 생성 함수 생성 (state 값 변경하는 함수)
export const setSelect = createAction(SET_SELECT, select => select);
export const setUsers = createAction(SET_USERS, users => users);

// 각 액션에 대한 업데이트 함수 정의
export default handleActions({
  [SET_SELECT]: (state, { payload: select }) => ({ ...state, select }),
  [SET_USERS]: (state, { payload: users }) => ({ ...state, users })
}, initialState);