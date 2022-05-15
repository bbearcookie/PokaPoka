import { combineReducers } from 'redux';
import photocardListPage from './photocardListPage';
import tradeListPage from './tradeListPage';
import tradeExplorePage from './tradeExplorePage';

// 리듀서 모듈 등록
const rootReducer = combineReducers({
  photocardListPage,
  tradeListPage,
  tradeExplorePage
});

export default rootReducer;