const router = require('../config/express').router;
const { db } = require('../config/database');

//알고리즘
//1. 사용자로 부터 아이디, 이름, 전화번호 받기
//2. 전화 번호 인증
//3. 새로운 비밀번호 입력
//4. 비밀번호 재설정

//비밀 번호 재설정
// router.post('/reset-password', (req, res) => {
//     // 입력받은 token 값이 Auth 테이블에 존재하며 아직 유효한지 확인
//     Auth.findOne({
//       where: {
//         token: {
//           like: req.body.token
//         },
//         created: {
//           greater: new Date.now() - ttl
//         }
//       }
//     }).then((Auth) => { // 유저데이터 호출
//       User.find(...)
//     }).then(user) => { // 유저 비밀번호 업데이트
//       User.update(...)
//     }
//   });

module.exports = router;