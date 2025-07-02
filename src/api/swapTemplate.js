import request from "../utils/request";

export function getGroupList(data) {
  return request({
    url: "/system/templates",
    method: "GET",
    preventLoading: true,
    loginRequired: false,
    data,
  });
}
//模版分类
export function getTmpList(data) {
  return request({
    url: "/system/template/category",
    method: "GET",
    preventLoading: true,
    loginRequired: false,
    data,
  });
}