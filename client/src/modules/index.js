import { combineReducers } from 'redux';
import photocardListPage from './photocardListPage';
import tradeListPage from './tradeListPage';
import UserListPage from './UserListPage';
import tradeExplorePage from './tradeExplorePage';

// 리듀서 모듈 등록
const rootReducer = combineReducers({
  photocardListPage,
  tradeListPage,
  UserListPage,
  tradeExplorePage
});

export default rootReducer;