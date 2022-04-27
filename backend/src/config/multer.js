const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsAsync = require('fs');

const IDOL_GROUP_IMAGE_DIR = 'public/image/group/'; // 아이돌 그룹 이미지 폴더
const IDOL_MEMBER_IMAGE_DIR = 'public/image/member/' // 아이돌 멤버 이미지 폴더
const ALBUM_IMAGE_DIR = 'public/image/album/'; // 앨범 이미지 폴더

// 파일의 mimeType에 따른 확장자를 반환하는 함수
function getExtension(mimeType) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';

  return '';
}

const groupImageUpload = multer({
  storage: multer.diskStorage({

    // 파일이 저장될 디렉토리 경로 지정
    destination: async (req, file, cb) => {

      // 디렉토리가 아직 없으면 생성함
      await fs.access(IDOL_GROUP_IMAGE_DIR, fsAsync.constants.F_OK).catch(async () => {
        try {
          await fs.mkdir(IDOL_GROUP_IMAGE_DIR, { recursive: true });
        } catch (err) { console.error(err); }
      });

      // 파일이 저장될 디렉토리 지정
      cb(null, IDOL_GROUP_IMAGE_DIR);
    },

    // 저장될 파일 이름 지정
    filename: (req, file, cb) => {
      let ext = getExtension(file.mimetype);
      cb(null, 'temp_' + Date.now() + '.' + ext);
    }

  })
});

module.exports.getExtension = getExtension;
module.exports.groupImageUpload = groupImageUpload;
module.exports.IDOL_GROUP_IMAGE_DIR = IDOL_GROUP_IMAGE_DIR;