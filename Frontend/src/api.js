import axios from "axios";
import config from "./config"
const instance =  axios.create({
    baseURL: config.baseURL,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  });

export default instance