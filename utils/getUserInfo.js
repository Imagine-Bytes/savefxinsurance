
import axios from 'axios';

async function getInfo(access_token) {
  const { data } = await axios({
    url: 'https://api.github.com/user',
    method: 'get',
    headers: {
      Authorization: `token ${access_token}`,
    },
  });
  console.log(data); // { id, email, name, login, avatar_url }
  return data;
};
module.exports =  getInfo