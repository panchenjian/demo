import request, { baseUrl, requireLogin } from "../utils/request";

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
//模板详情
export function getTmpDetail(uuid) {
  const token = uni.getStorageSync("token");
  // 如果存在 token，则将其添加到请求头中
  let header;
  if (token) {
    header = { Authorization: token };
  } else {
    requireLogin();
    return Promise.reject(new Error("No token found"));
  }

  return request({
    url: `/system/template/${uuid}`,
    method: "GET",
    header: header,
    preventLoading: true,
    loginRequired: false,
    // data,
  });
}
