import { request } from "../index";

const baseURL = "/teacher";

export default {
  login: (teacher) => {
    return request({
      url: `${baseURL}/login`,
      method: "POST",
      data: teacher,
    });
  }
};