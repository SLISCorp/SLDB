import Session from "../helpers/session";
import axios from 'axios';

const http = async (method, path, body = undefined, contentType = "application/json") => {
  const authToken = Session.getSession("token");
  const url = process.env.REACT_APP_API_BASE_URL + path;
  return new Promise((resolve, reject) => {
    axios({
      method: method,
      url: url,
      data: body,
      headers: {
        'Content-Type': contentType,
        'x-access-token': authToken ? `${authToken}` : '',
      },
    }).then((result) => {
      if ([401, 403].indexOf(result.status) !== -1) {
        window.location.reload();
        Session.clearItem("ModexWeb");
        Session.clearItem("token");
        Session.clearItem("email");
      };
      resolve(result)
    }).catch(err => {

      reject(err)
    })
  })
};

export function uploadImageWithData(method, path, body = undefined) {
  const authToken = Session.getSession("token");
  const url = process.env.REACT_APP_API_BASE_URL + path;
  return fetch(url, {
    method: method,
    body: body,
    headers: {
      // "Content-Type": "multipart/form-data",
      'x-access-token': authToken ? `${authToken}` : '',
    },
  })
    .then((apiRes) => {
      return apiRes.json();
    })
    .then((jsonRes) => {
      // on login session expire error
      if ([401, 403].indexOf(jsonRes.status) !== -1) {
        Session.clearItem("ModexWeb");
        Session.clearItem("token");
        Session.clearItem("email");
        window.location.reload();
      }

      return jsonRes;
    })
    .catch((err) => {
      console.log(err);
    });
}

export default http