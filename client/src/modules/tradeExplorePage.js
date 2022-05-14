import { createAction, handleActions } from 'redux-actions';
import produce from 'immer';

// 초기 상태 지정
const initialState = {
  have: {
    groupId: '',
    memberId: ''
  },
  want: {
    groupId: '',
    memberId: ''
  },
  voucherId: '', // 사용자가 사용하기로 선택한 소유권 ID
  photocardId: '', // 사용자가 갖길 원하는 포토카드 ID
  groups: [], // Select 태그에 보여줄 그룹 목록
  members: [], // Select 태그에 보여줄 멤버 목록
  vouchers: [], // 화면에 보여줄 소유권 목록
  photocards: [], // 화면에 보여줄 포토카드 목록
  trades: [], // 화면에 보여줄 교환글 목록
}

// 액션 타입 정의
const SET_HAVE_GROUPID = 'photocardListPage/SET_HAVE_GROUPID';
const SET_HAVE_MEMBERID = 'photocardListPage/SET_HAVE_MEMBERID';
const SET_WANT_GROUPID = 'photocardListPage/SET_WANT_GROUPID';
const SET_WANT_MEMBERID = 'photocardListPage/SET_WANT_MEMBERID';
const SET_VOUCHER_ID = 'photocardListPage/SET_VOUCHER_ID';
const SET_PHOTOCARD_ID = 'photocardListPage/SET_PHOTOCARD_ID';
const SET_GROUPS = 'photocardListPage/SET_GROUPS';
const SET_MEMBERS = 'photocardListPage/SET_MEMBERS';
const SET_VOUCHERS = 'photocardListPage/SET_VOUCHERS';
const SET_PHOTOCARDS = 'photocardListPage/SET_PHOTOCARDS';
const SET_TRADES = 'photocardListPage/SET_TRADES';

// 액션 생성 함수 생성 (state 값 변경하는 함수)
export const setHaveGroupId = createAction(SET_HAVE_GROUPID, groupId => groupId);
export const setHaveMemberId = createAction(SET_HAVE_MEMBERID, memberId => memberId);
export const setWantGroupId = createAction(SET_WANT_GROUPID, groupId => groupId);
export const setWantMemberId = createAction(SET_WANT_MEMBERID, memberId => memberId);
export const setVoucherId = createAction(SET_VOUCHER_ID, voucherId => voucherId);
export const setPhotocardId = createAction(SET_PHOTOCARD_ID, photocardId => photocardId);
export const setGroups = createAction(SET_GROUPS, groups => groups);
export const setMembers = createAction(SET_MEMBERS, members => members);
export const setVouchers = createAction(SET_VOUCHERS, vouchers => vouchers);
export const setPhotocards = createAction(SET_PHOTOCARDS, photocards => photocards);
export const setTrades = createAction(SET_TRADES, trades => trades);

// 각 액션에 대한 업데이트 함수 정의
export default handleActions({
  [SET_HAVE_GROUPID]: (state, { payload: groupId }) =>
    produce(state, draft => {
      draft.have.groupId = groupId;
    }),
  [SET_HAVE_MEMBERID]: (state, { payload: memberId }) =>
    produce(state, draft => {
      draft.have.memberId = memberId;
    }),
  [SET_WANT_GROUPID]: (state, { payload: groupId }) =>
    produce(state, draft => {
      draft.want.groupId = groupId;
    }),
  [SET_WANT_MEMBERID]: (state, { payload: memberId }) =>
    produce(state, draft => {
      draft.want.memberId = memberId;
    }),
  [SET_VOUCHER_ID]: (state, { payload: voucherId }) => ({ ...state, voucherId }),
  [SET_PHOTOCARD_ID]: (state, { payload: photocardId }) => ({ ...state, photocardId }),
  [SET_GROUPS]: (state, { payload: groups }) => ({ ...state, groups }),
  [SET_MEMBERS]: (state, { payload: members }) => ({ ...state, members }),
  [SET_VOUCHERS]: (state, { payload: vouchers }) => ({ ...state, vouchers }),
  [SET_PHOTOCARDS]: (state, { payload: photocards }) => ({ ...state, photocards }),
  [SET_TRADES]: (state, { payload: trades }) => ({ ...state, trades })
}, initialState);