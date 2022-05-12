import { combineReducers } from 'redux';
import photocardListPage from './photocardListPage';
import tradeListPage from './tradeListPage';
import UserListPage from './UserListPage';

// 리듀서 모듈 등록
const rootReducer = combineReducers({
  photocardListPage,
  tradeListPage,
  UserListPage
});

export default rootReducer;