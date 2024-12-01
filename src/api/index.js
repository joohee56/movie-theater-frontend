import axios from "axios";
axios.defaults.withCredentials = true;

const config = {
  baseUrl: "http://api.th3-m0v1e.com:8080/api/v1",
};

function jsonApiInstance() {
  const instance = axios.create({
    baseURL: config.baseUrl,
    headers: {
      "content-type": "application/json",
    },
  });
  return instance;
}

function multipartApiInstance() {
  const instance = axios.create({
    baseURL: config.baseUrl,
    headers: {
      "content-type": "multipart/from-data",
    },
  });
  return instance;
}

export { jsonApiInstance, multipartApiInstance };
