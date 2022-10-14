// support/errorCode.js

module.exports = Object.freeze({
  None: 0,
  ServerError: 1,
  InvalidData: 2,

  ExpiredAccessToken: 3,
  InvalidAccessToken: 4,
  ExpiredRefreshToken: 5,
  InvalidRefreshToken: 6,
  RevokedRefreshToken: 7,

  NoEntry: 8,
  DuplicateEntry: 9,
  InvalidRequest: 10,
});

