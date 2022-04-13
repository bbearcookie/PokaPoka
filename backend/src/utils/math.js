// min ~ max 사이의 임의의 정수 반환
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

module.exports.getRandomInt = getRandomInt;