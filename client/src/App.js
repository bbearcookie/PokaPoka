import { useEffect, useContext } from 'react';
import { Route, Routes } from 'react-router-dom';
import useRequest from './utils/useRequest';
import * as api from './utils/api';
import AuthContext from './contexts/Auth';
import { STORAGE_KEY_NAME } from './contexts/Auth';
import IndexPage from './pages/IndexPage';
import TestPage from './pages/TestPage';
import LoginPage from './pages/LoginPage';
import LoginSuccessPage from './pages/LoginSuccessPage';
import AdminMainPage from './pages/admin/MainPage';
import GroupListPage from './pages/admin/group/GroupListPage';
import GroupDetailPage from './pages/admin/group/GroupDetailPage';
import GroupWriterPage from './pages/admin/group/GroupWriterPage';
import MemberWriterPage from './pages/admin/member/MemberWriterPage';
import MemberDetailPage from './pages/admin/member/MemberDetailPage';
import AlbumWriterPage from './pages/admin/album/AlbumWriterPage';
import AlbumDetailPage from './pages/admin/album/AlbumDetailPage';
import PhotocardListPage from './pages/admin/photocard/PhotocardListPage';
import PhotocardWriterPage from './pages/admin/photocard/PhotocardWriterPage';
import PhotocardDetailPage from './pages/admin/photocard/PhotocardDetailPage';
import SignupPage from './pages/SignupPage';
import UsernamePage from './pages/UsernamePage';
import PasswordPage from './pages/find_password/PwPage';
import SignupCompletePage from './pages/SignupCompletePage';
import PwChangePage from './pages/find_password/PwChangePage';
import CertificationPage from './pages/find_password/CertificationPage';
import UserMainPage from './pages/MainPage';
import SuggestionListPage from './pages/admin/suggestion/SuggestionListPage';
import SuggestionDetailPage from './pages/admin/suggestion/SuggestionDetailPage';
import NoticeListPage from './pages/admin/notice/NoticeListPage';
import NoticeListUserPage from './pages/NoticeListUserPage';
import NoticeDetailPage from './pages/admin/notice/NoticeDetailPage';
import NoticeDetailUserPage from './pages/NoticeDetailUserPage';
import NoticeWriterPage from './pages/admin/notice/NoticeWriterPage';
import AdminVoucherRequestListPage from './pages/admin/voucher/VoucherRequestListPage';
import AdminVoucherRequestDetailPage from './pages/admin/voucher/VoucherRequestDetailPage';
import VoucherProvisionWriter from './pages/admin/voucher/VoucherProvisionWriter';
import VoucherRequestListPage from './pages/mypage/voucher_request/VoucherRequestListPage';
import VoucherRequestDetailPage from './pages/mypage/voucher_request/VoucherRequestDetailPage';
import VoucherRequestWriterPage from './pages/mypage/voucher_request/VoucherRequestWriterPage';
import SuggestionRequestListPage from './pages/mypage/SuggestionRequestList';
import SuggestionWriterPage from './pages/mypage/SuggestionWriterPage';
import SuggestionRequestDetailPage from './pages/mypage/SuggestionRequestDetailPage';
import DeliveryInfoPage from './pages/mypage/DeliveryInfoPage';
import DeliveryInfoWritePage from './pages/mypage/DeliveryInfoWritePage';
import EditUserPage from './pages/mypage/EditUserPage';
import UserInfoPage from './pages/mypage/UserInfoPage';
import VoucherProvisionListPage from './pages/admin/voucher/VoucherProvisionList';
import UserListPage from './pages/admin/user/UserListPage';
import WithdrawalUserListPage from './pages/admin/user/WithdrawalUserListPage';
import InactiveUserListPage from './pages/admin/user/InactiveUserListPage';
import UserDetailPage from './pages/admin/user/UserDetailPage';
import UserListSearchPage from './pages/admin/user/UserListSearchPage';
import PermanentVoucherListPage from './pages/stoarage/PermanentVoucherListPage';
import TemporalVoucherListPage from './pages/stoarage/TemporalVoucherListPage';
import TradeListPage from './pages/trade/TradeListPage';
import TradeFavoriteListPage from './pages/trade/TradeFavoriteListPage';
import TradeWriterPage from './pages/trade/TradeWriterPage';
import TradeDetailPage from './pages/trade/TradeDetailPage';
import TradeExplorePage from './pages/trade/TradeExplorePage';
import TradeHistoryPage from './pages/trade/TradeHistoryPage';
import ShippingRequestPage from './pages/mypage/ShippingRequestPage';
import ShippingRequestListPage from './pages/mypage/ShippingRequestListPage';
import ShippingRequestDetailPage from './pages/mypage/ShippingRequestDetailPage';
import ShippingListPage from './pages/admin/shipping/ShippingListPage';
import ShippingDetailPage from './pages/admin/shipping/ShippingDetailPage';
import ShippingProvisionListPage from './pages/admin/shipping/ShippingProvisionListPage';

function App() {
  const { state: authState, actions: authActions } = useContext(AuthContext);
  const request = useRequest();

  // ????????? ????????? ??????. ?????????????????? ?????? URL ???????????? ????????? ?????? ?????? ?????? ???????????????,
  // ?????? ??????????????? ????????? ???????????? ????????? ????????? ????????? ??? ????????? API ????????? ????????? ????????? ??? ????????? ???????????????.
  const onLoad = async () => {
    let user = localStorage.getItem(STORAGE_KEY_NAME);
    if (!user) return; // ????????? ????????? ????????? ??????

    // API ????????? ????????? ?????? ?????? ??????
    try {
      const res = await request.call(api.postTokenTest);
      authActions.login(res);
    // ?????? ????????? ????????? ?????? ?????????
    } catch (err) {
      authActions.logout();
    }
  }
  useEffect(() => { onLoad(); }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<IndexPage /> } />
        
        <Route path="/main" element={<UserMainPage /> } />
        <Route path="/main/notice/detail/:noticeId" element={<NoticeDetailUserPage />}/>

        <Route path="/test" element={<TestPage />} />

        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/login/success" element={<LoginSuccessPage />} />
        <Route path="/auth/signup" element={<SignupPage />} />
        <Route path="/auth/signupcomplete" element={<SignupCompletePage />} />
        <Route path="/auth/signupcomplete" element={<SignupCompletePage />} />

        <Route path="/admin" element={<AdminMainPage />} />
        <Route path="/admin/group" element={<GroupListPage />} />
        <Route path="/admin/group/writer" element={<GroupWriterPage />} />
        <Route path="/admin/group/writer/:groupId" element={<GroupWriterPage />} />
        <Route path="/admin/group/detail/:groupId" element={<GroupDetailPage />} />
        <Route path="/admin/member/writer" element={<MemberWriterPage />} />
        <Route path="/admin/member/writer/:memberId" element={<MemberWriterPage />} />
        <Route path="/admin/member/detail/:memberId" element={<MemberDetailPage />} />
        <Route path="/admin/album/writer" element={<AlbumWriterPage />} />
        <Route path="/admin/album/writer/:albumId" element={<AlbumWriterPage />} />
        <Route path="/admin/album/detail/:albumId" element={<AlbumDetailPage />} />
        <Route path="/admin/photocard" element={<PhotocardListPage />} />
        <Route path="/admin/photocard/writer" element={<PhotocardWriterPage />} />
        <Route path="/admin/photocard/writer/:photocardId" element={<PhotocardWriterPage />} />
        <Route path="/admin/photocard/detail/:photocardId" element={<PhotocardDetailPage />} />
        <Route path="/admin/suggestion" element={<SuggestionListPage />}/>
        <Route path="/admin/suggestion/detail/:suggestionId" element={<SuggestionDetailPage />}/>
        <Route path="/admin/voucher/request" element={<AdminVoucherRequestListPage />}/>
        <Route path="/admin/voucher/request/detail/:requestId" element={<AdminVoucherRequestDetailPage />}/>
        <Route path="/admin/voucher/provision" element={<VoucherProvisionListPage />}/>
        <Route path="/admin/voucher/provision/writer" element={<VoucherProvisionWriter />}/>
        <Route path="/admin/voucher/provision/writer/:requestId" element={<VoucherProvisionWriter />}/>
        <Route path="/admin/notice" element={<NoticeListPage />}/>
        <Route path="/notice" element={<NoticeListUserPage />}/>
        <Route path="/admin/notice/detail/:noticeId" element={<NoticeDetailPage />}/>
        <Route path="/admin/notice/writer" element={<NoticeWriterPage />}/>
        <Route path="/admin/notice/writer/:noticeId" element={<NoticeWriterPage />}/>
        <Route path="/admin/user" element={<UserListPage />}/>
        <Route path="/admin/user/withdrawal" element={<WithdrawalUserListPage />}/>
        <Route path="/admin/user/inactive" element={<InactiveUserListPage />}/>
        <Route path="/admin/user/detail/:username" element={<UserDetailPage />}/>
        <Route path="/admin/user/search/:username" element={<UserListSearchPage />}/>
        <Route path="/admin/shipping" element={<ShippingListPage />}/>
        <Route path="/admin/shipping/provision" element={<ShippingProvisionListPage />}/>
        <Route path="/admin/shipping/request/detail/:requestId" element={<ShippingDetailPage />}/>

        <Route path="/finding/password" element={<PasswordPage />} />
        <Route path="/finding/pwchange" element={<PwChangePage />}/>
        <Route path="/finding/username" element={<UsernamePage />} />
        <Route path="/finding/sms" element={<CertificationPage />}/>
      
        <Route path="/mypage/voucher" element={<VoucherRequestListPage />}/>
        <Route path="/mypage/voucher/detail/:requestId" element={<VoucherRequestDetailPage />}/>
        <Route path="/mypage/voucher/writer" element={<VoucherRequestWriterPage />}/>
        <Route path="/mypage/voucher/writer/:requestId" element={<VoucherRequestWriterPage />}/>
        <Route path="/mypage/suggestion" element={<SuggestionRequestListPage />}/>
        <Route path="/mypage/suggestion/writer" element={<SuggestionWriterPage />}/>
        <Route path="/mypage/suggestion/detail/:suggestionId" element={<SuggestionRequestDetailPage />}/>
        <Route path="/mypage/deliveryinfo" element={<DeliveryInfoPage />}/>
        <Route path="/mypage/deliveryinfo/write" element={<DeliveryInfoWritePage />}/>
        <Route path="/mypage/userInfo/edit" element={<EditUserPage />}/>
        <Route path="/mypage/userInfo" element={<UserInfoPage />}/>
        <Route path="/mypage/shipping/request" element={<ShippingRequestPage />}/>
        <Route path="/mypage/shipping" element={<ShippingRequestListPage />}/>
        <Route path="/mypage/shipping/detail/:requestId" element={<ShippingRequestDetailPage />}/>

        <Route path="/stoarage/permanent" element={<PermanentVoucherListPage />}/>
        <Route path="/stoarage/temporal" element={<TemporalVoucherListPage />}/>

        <Route path="/trade/all" element={<TradeListPage />}/>
        <Route path="/trade/favorite" element={<TradeFavoriteListPage />}/>
        <Route path="/trade/writer" element={<TradeWriterPage />}/>
        <Route path="/trade/writer/:tradeId" element={<TradeWriterPage />}/>
        <Route path="/trade/detail/:tradeId" element={<TradeDetailPage />}/>
        <Route path="/trade/explore" element={<TradeExplorePage />}/>
        <Route path="/trade/history" element={<TradeHistoryPage />}/>
      </Routes>
    </div>
  );
}

export default App;
