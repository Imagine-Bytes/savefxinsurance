import axios from 'axios';
const dotenv = require("dotenv")

dotenv.config()

const  queryString = require('query-string');

async function getAuthCode(code) {
  const { data } = await axios({
    url: 'https://github.com/login/oauth/access_token',
    method: 'get',
    params: {
      client_id: process.env.APP_ID,
      client_secret: process.env.APP_SECRET,
      redirect_uri: 'http://localhost:5000/githublogin',
      code,
    },
  });
 
  const parsedData = queryString.parse(data);
//   console.log(parsedData); // { token_type, access_token, error, error_description }
  if (parsedData.error) throw new Error(parsedData.error_description)
  return parsedData.access_token;
};


module.exports = getAuthCode
