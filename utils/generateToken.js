const jwt = require('jsonwebtoken');

const generateToken = (res, username) => {
  const expiration =  60 * 60 * 24 * 3;
  const token = jwt.sign({ username }, process.env.SECRET_KEY, {
    expiresIn:  60 * 60 * 24 * 4,
  });
  return res.cookie('token', token, {
    expires: new Date(Date.now() + expiration),
    secure: false, // set to true if your using https
    httpOnly: true,
  }).json({status:"Logged In", token});
};
module.exports = generateToken
