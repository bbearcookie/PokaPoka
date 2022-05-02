import { createAction, handleActions } from 'redux-actions';

// 초기 상태 지정
const initialState = {
  select: {
    groupId: '',
    memberId: ''
  },
  groups: [], // Select 태그에 보여줄 그룹 목록
  members: [], // Select 태그에 보여줄 멤버 목록
  photocards: [], // 화면에 보여줄 포토카드 목록
}

// 액션 타입 정의
const SET_SELECT = 'photocardListPage/SET_SELECT';
const SET_GROUPS = 'photocardListPage/SET_GROUPS';
const SET_MEMBERS = 'photocardListPage/SET_MEMBERS';
const SET_PHOTOCARDS = 'photocardListPage/SET_PHOTOCARDS';

// 액션 생성 함수 생성 (state 값 변경하는 함수)
export const setSelect = createAction(SET_SELECT, select => select);
export const setGroups = createAction(SET_GROUPS, groups => groups);
export const setMembers = createAction(SET_MEMBERS, members => members);
export const setPhotocards = createAction(SET_PHOTOCARDS, photocards => photocards);

// 각 액션에 대한 업데이트 함수 정의
export default handleActions({
  [SET_SELECT]: (state, { payload: select }) => ({ ...state, select }),
  [SET_GROUPS]: (state, { payload: groups }) => ({ ...state, groups }),
  [SET_MEMBERS]: (state, { payload: members }) => ({ ...state, members }),
  [SET_PHOTOCARDS]: (state, { payload: photocards }) => ({ ...state, photocards })
}, initialState);