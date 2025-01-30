import request from "../utils/request";

export function getAppConfig() {
  return request({
    url: "/api/index/config",
    method: "GET",
    preventLoading: true,
  });
}
