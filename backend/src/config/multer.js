const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const fsAsync = require('fs');

const IDOL_GROUP_IMAGE_DIR = 'public/image/group/'; // 아이돌 그룹 이미지 폴더
const IDOL_MEMBER_IMAGE_DIR = 'public/image/member/' // 아이돌 멤버 이미지 폴더
const ALBUM_IMAGE_DIR = 'public/image/album/'; // 앨범 이미지 폴더
const PHOTOCARD_IMAGE_DIR = 'public/image/photocard/'; // 포토카드 이미지 폴더

// 파일의 mimeType에 따른 확장자를 반환하는 함수
function getExtension(mimeType) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/png') return 'png';

  return '';
}

// 해당 디렉터리에 파일을 저장하는 multer 업로더를 반환하는 함수
function createUploader(dir) {
  return multer({
    storage: multer.diskStorage({
  
      // 파일이 저장될 디렉토리 경로 지정
      destination: async (req, file, cb) => {
  
        // 디렉토리가 아직 없으면 생성함
        await fs.access(dir, fsAsync.constants.F_OK).catch(async () => {
          try {
            await fs.mkdir(dir, { recursive: true });
          } catch (err) { console.error(err); }
        });
  
        // 파일이 저장될 디렉토리 지정
        cb(null, dir);
      },
  
      // 저장될 파일 이름 지정
      filename: (req, file, cb) => {
        let ext = getExtension(file.mimetype);
        cb(null, 'temp_' + Date.now() + '.' + ext);
      }
    })
  })
}

const groupImageUpload = createUploader(IDOL_GROUP_IMAGE_DIR); // 아이돌 그룹 이미지 업로더
const memberImageUpload = createUploader(IDOL_MEMBER_IMAGE_DIR); // 아이돌 멤버 이미지 업로더
const albumImageUpload = createUploader(ALBUM_IMAGE_DIR); // 앨범 이미지 업로더
const photocardImageUpload = createUploader(PHOTOCARD_IMAGE_DIR); // 포토카드 이미지 업로더

module.exports.getExtension = getExtension;
module.exports.groupImageUpload = groupImageUpload;
module.exports.memberImageUpload = memberImageUpload;
module.exports.albumImageUpload = albumImageUpload;
module.exports.photocardImageUpload = photocardImageUpload;
module.exports.IDOL_GROUP_IMAGE_DIR = IDOL_GROUP_IMAGE_DIR;
module.exports.IDOL_MEMBER_IMAGE_DIR = IDOL_MEMBER_IMAGE_DIR;
module.exports.ALBUM_IMAGE_DIR = ALBUM_IMAGE_DIR;
module.exports.PHOTOCARD_IMAGE_DIR = PHOTOCARD_IMAGE_DIR;