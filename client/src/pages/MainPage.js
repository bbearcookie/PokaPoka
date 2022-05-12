import React, { useState, useEffect } from 'react';
import useRequest from '../utils/useRequest';
import * as api from '../utils/api';
import UserTemplate from '../templates/UserTemplate';
import PhotoStoarageSidebar from '../components/sidebar/PhotoStoarageSidebar';
import LoadingSpinner from '../components/LoadingSpinner';
import NoticeList from '../components/list/NoticeList';
import TradeList from '../components/list/TradeList';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './MainPage.scss';

const MainPage = () => {
  const request = useRequest();
  const [notices, setNotices] = useState([]);
  const [trades, setTrades] = useState([]);

  // 화면 로드시 작동
  const onLoad = async (e) => {
    try {
      const res = await request.call(api.getNoticeList);
      setNotices(res.notice);
      const res2 = await request.call(api.getTradeListAll, {
        state: 'finding'
      });
      setTrades(res2.trades);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => { onLoad(); }, []);

  return (
    <UserTemplate className="MainPage">
      {request.loading ? <LoadingSpinner /> : null}

      <section className="title_area">
        <h1 className="title-label">이벤트 배너</h1>
      </section>

      <section className="slider_area">
        <Slider
          className="slider"
          dots={true}
          arrows={true}
          infinite={true}
          speed={800}
          slidesToShow={1}
          slidesToScroll={1}
          autoplay={true}
          autoplaySpeed={8000}
          pauseOnHover={true}
        >
          <img src="https://lh3.googleusercontent.com/fife/AAWUweV6DTOlw97Fl1tdnXgtitM_LVQqasxMNMSANgkblRzyIZgv7GT88VkbUO6bxZfwvI5lxW5JY4_NrzD17TRG49nPh9YHxo9JCwejwhhJqaHt8UqUv9bhFxSKw61xteMiXqd56yZDA3qTV8DikFHcVUCpF10Tq6lCN_3e5HOWCnQlTImHimtvBpyeVnA1cLUON7yMLe3nfFNmoQXDJgjo88TC0cHWRJ47Hlgv2w8xjlh3eQ_BSbTEbs4dViZYmL_bUBgLTW3Gi0TZ9SFGvj8xyzkXcBR1qZ79TDNO_tNtEtFls6QXgjRUHSnEZUrboitgcjdZwxxtI_n_lyl53E3l30Cw-aztgpnQaY3afflQ80A8GExyNnFmogqR7RNA99LVD1L8wyAx6bnDMvlg8x5-iiNsSnObb_SScFAS_ur0TQwsoALShDJpUIuUL7eyVTlLWcqnjJrVExdApZWRFKOtlVUX-7WtolnvgZC6fLDARl1eIfZNvKZQl1V76USqsTq9bMBvs_TUBfq3__rbmojl87HxuG1rtYKuzJpWsZ4vrFGaiqSj0N1O0cISI9cIiTzZwIGeA6pILaivd3qWTKJV1yH4iVeKV3Q_evnQDQzdv1iEkyZL6j9ttqbFzkWRdv6Y97gI1M0cV6MIkvgY8Ir-AMrxXLT2KejrF4X2O9_U7krskGEyvE_VkNcGVc3LUWar9_pMvZwRJNhsHMOJnNq_MllblAlPPVwCsEI1lfhZiqGPSijppJc-h-wDUZD3g3qbaw7_hjOtvXqd8esfoPDDotPJijNZk4qj0O0musGeEWfhykcguj-R92nJj2J234ZIw2AtZCO9BWqmmrfe_ANGkYJF12VpHFcbvtq4kS-40HkgwT5RFDVvzGdzd_W_OILooDcDlJ4OOAAaTgDY_qQr79Nu_rYUKeYK21zWA4FsA0vZyUeWyaSl1VoNhvx92ao0SANJQuLDrZP9UNLjx6HeHsqNxQc4rvIW8GU9ZUFW-IixtARYkblT-z58GT9kY1kFM1oZPo3Bo5SFXpsQEpm69qDRQHg9jivMjtYkhpvaTLoixT5vpcTM2zigFF1n46oClEXBNkvQR4KXTTc3Z5Gs-cumnn15q6C1QiZXPphu19thRt-tc9PSE7nf9S_H_26wyw1eiqBmIDjp2s3Ob-7FpCjLCUqAZmYbg0TVGJSra1Mro3hpuks-dcTrh3Dye9G4caanOEgh5EyNAsOkfIep7IOVAZ4LqAv7qOE2k5IluH9LH1XdkSx1vOx6vFnDU9KeJc7NBNYSbpYX1fhJBq_XiPJYOrY9pGaf9aAaMzgrlnwdHezaJenYCylMk0G1Ewvy9870QN6hgTvWN20Eiv5B=w3074-h1778"/>
          <img src="https://lh3.googleusercontent.com/fife/AAWUweWd3uPZkxXgzOTDzaHTuYpgcXnqDKgqFQMUNHLFMf6YY7E0IovAK4tZ2YJSAfsfFmeGYE4CDNucVR-kkNnlTht3Wikvn6irjvDB5Gh4ducYhPp8hjaZmI5WGFxH186PZ1tL40p84Llp987Z_goXwuT-njXtk80MJJ9CFvi8d6vHon5kdXt7Pm5qM_vJ22D5rvdoDow-Qf2kuFklkvQPdg22YODfduQgUZMFB1nHni0SonzEuiEGG1HXGkfxfWleWHMWxKZm-Mrhi_tZnqppFefmCxax7c8gnTthqiFhuq3It3jx2DMOsk_ikWrfAbstqQ7S0rQcdnohBdUWu17i4wi6eO_i3XMloslENwpLR6n490YnD-xEk4Xe4fjWa8TK42nrXCPyDNXv4GT5o__0_H77wBAW-zTs9s14TNXwkpNS1sIxqQNlanzteb3ATxJsVbBSevsGo60a0KzZaxsLUFoD6JwOZ30DOaS7ALeqV8cyA2Pq9Rz6zq3ermysInwj1R70c4DhvLP4NNPVht3pmeePQd2J9eI2y4eX1SqAV98wOHJDLkUk75lFqmewtBCbYuhjS-zf2Nivn5b_nBpDEpGZG1d2D-E4ML6UCJRQ9RCC7yJfPeYbdsCQuF_jni1F3Ld6n75bCDAhc7u94NZ3g6QgogJnqCneLxSZJGPLWzwzXUiSXhtO-QiEJoFwSjLUMtzgBqpJcWMphRAlbf-Q9O23dUU6X5r9jXIKqzxkZ6MxX05aCmtabetQ6AJrcRgYsRbqTzFzaO_XAflPjq9ucj6TmNxv9FAy6YR8XrlvpjplOind0Wyuh1PFMHWC-MSk7aDQlbVqnvRQZcVznYS8vjvaJevjVRBa_GbJMF-GhWqf5M14GrvU1iQYmGr4Bw_R0nQKkyqLsFGaSoZLux2nj-jOCpKqLb40jIi1LSyqKZLpTCIYikqalSkCT70QVb63j_i4qiPkKXETy6RLfQ2fSEYyMzCTRB9hM4IaudNKnkgiCE-OQOdJ3AA_OUTNwUUNNLbgR35hBodhb4q6yhttjeZJXLEgQJW7QZ0hC_wrn8thTdgQQTst1wcLONFZwXLKYZpZwd50VYimdRSKR7Gp52pnRM7k7fOPGpU2gx72hWeex2Mkz2qb_e64z-CRkizLPNo5MXgnsT3hveWd4dICJeqHN3tQBnWCzIIxPUXVCZI0K50Hfp_7ZS0We6p_94PJBVP8VT6yj5tUWGOPHvmIHKE2uisZL9M7eRbq95V7Xp_VAodndvQ614dvbbjvLPp2oTQJCre0O7G7sNJQ2b9jpj9VAgNlG0qQ6CJ8lu-pkwCoIPHlvtxQuo67d53hkvsG7LaNnT5OrUDhn1jHncqE=w2000-h2514"/>
          <img src="https://lh3.googleusercontent.com/fife/AAWUweWBRjD_w5r5lR-K-RubQlz9hscKYkQ41gPzSOWGYGT7uA4QbCGGRI2RCmfwf99cBEhkOV4cx8XolQMmUdgO8R14gKlRFPk8_HR_4GB5aCYMrUQqSFsVnNK1MmNuW7f29U2MC-jiHsa_nRW0EQmADGPLZj0HjPY33wTD1HtS8lgnIAhcv91IwQ6QK_nwKvbnxKVSANnkKQ3h7a5VDFeRR1ecBkSmUTHjmx_yR7J3etBP24cA8YY5E5GeeAgGgRchyG9Ph2CTOHilLq3AvVVgwodixuk1fH-jjwZYX6b0C_Uo5EUAu9iovfZfgxqvYodJ48dWsDKeBIvhBUNzW92iKCw7oNDbfgfyzvCTk0aq200U99wXCrWtAVcwX4SyTNxcsf2cxKEcMYWv8bn4PZQMvr9zik1vcV8gDp-CstawdQf31j3m3ZiuDYLxV-S4ya7mt9UVXK7riLOmdcPntZm5SbldFjHt1xxR3BV6uW8f1LpqMIwdDRw4I0ihXl99ODSB6JKXNfbgPW3DU6Bq0N2FfbngUAJbnaX5UxglRBJYMG3SBp1Oqz0jMdkxlC0FJJwrmvHIU6q4x7o33Ev-WBFbrdDruMJiLAMl-N4UCZwJigB5ksjS_tmc8EOr9hYqcSEJApZcIRTrGVImDG1HwG_dtYvBxre1bzaWngjs_MbeTruKftfCmOO9Sv2xRD63uGQVO5JukQPjpI_M_kaq5M78pn-0hWIo7SComJGSB6eqgVQQXbxCz0STL0CAnXX509VEAp7uZhR7jc46SnAjfqGayz7HXQBO3kVX74I9AZk_MyPAwGFTbTmeOLjWfeY_lYzKWv3GK_y2O5Re1Z247M5cDjeoOA7FDalQwxcQe1Z1LyfZx-VqyCrLBi-EsDwsvW5l8fzWoRt1mSCPC8unB74U2YwM9sjKnkvQzRcN-yRiLqUMyik59mj31I_lSg3kQ0K1-A_0WzCNosuBDqKn4Akyi9y2YTX2kFK4ykNnAMYgtXVaPVw1Hz3whIHlr9XAR2n5AEmIpImrj2JSSIOx7p7ymYF8-kpL-9lcY7_HLgU-k3GZey71lPqxaw_CIE701zpIfy-KUyNQSoy_cOzq1BfsDlsKlsZ-lAcqSufBsXmEfgmjPUFNrtlpuTeLL0wGRXyUexQCk09GNrfkIhZYE1tVaYM6EVbY7y5yyd6OrhqH-n-nPOl5mXIO2aDi3ajzKVWEWeQRIoWcm70uXDaJzEYFiDpKulsoeWVISNmQ2QS2McgUKMFbobwL9Q7NrkZrUe8zoCe6_GNfli5l7N6sN4C2SMASeE3pK-SbNnUICc7gOmXK0mGuXnJAtxG-tIsQ0laOKb1-5vLaHGcBJrLABAKk=w1276-h1604"/>
        </Slider>
      </section>

      <section className="title_area">
        <h1 className="title-label">공지사항 목록</h1>
      </section>
      <NoticeList notices={notices} perPage="5" />

      <section className="title_area">
        <h1 className="title-label">최근 진행중인 포토카드 교환글</h1>
      </section>
      <TradeList contents={trades} perPage="5" />

    </UserTemplate>
  );
};

export default MainPage;