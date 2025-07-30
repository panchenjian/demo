import request, { baseUrl, requireLogin } from "../utils/request";

export function userRecords(data, preventLoading) {
  const token = uni.getStorageSync("token");
  return request({
    url: "/production/self",
    method: "GET",
    data,
    header: { Authorization: token },
    preventLoading,
    // loginParam: {
    //   redirectTab: "/pages/user/index",
    // },
  });
}

export function removeRecord(recordId) {
  return request({
    url: "/api/face_swap/remove_record",
    method: "POST",
    data: { id: recordId },
    preventLoading: true,
  });
}

export function createAvatar(filePath) {
  const token = uni.getStorageSync("token");

  // 如果存在 token，则将其添加到请求头中
  let header;
  if (token) {
    header = { Authorization: token };
  } else {
    requireLogin();
    return Promise.reject(new Error("No token found"));
  }

  return uni.uploadFile({
    //url: `${baseUrl}/api/face_swap/create_avatar`,
    url: `${baseUrl}/system/upload`,
    filePath: filePath,
    name: "file",
    header: header,
  });
  // let params = {
  //   url: `/system/upload`,
  //   method: "POST",
  //   data: {file:filePath},
  //   header: { Authorization: token },
  // };
  // params.loadingToastTips = "图片上传中...";
  // return request(params);
}
//生成2D图
export function createSwap(data) {
  const token = uni.getStorageSync("token");
  let params = {
    url: "/production",
    method: "POST",
    data: data,
    header: { Authorization: token },
  };
  params.loadingToastTips = "AI生成中...";
  return request(params);
}
//获取2d图生成进度
export function createProcess(uuid) {
  const token = uni.getStorageSync("token");
  let params = {
    url: `/production/process2d/${uuid}`,
    method: "GET",
    header: { Authorization: token },
    preventLoading: true,
  };
  // params.loadingToastTips = "AI生成中...";
  return request(params);
}

export function recordDetail(taskId) {
  return request({
    url: "/api/face_swap/record_detail",
    method: "GET",
    data: { id: taskId },
    preventLoading: true,
  });
}

export function getPolicy(data) {
  return request({
    url: "/api/index/policy",
    method: "GET",
    preventLoading: true,
    loginRequired: false,
    data,
  });
}
//获得SKU信息
export function getSku() {
  return request({
    url: "/production/sku",
    method: "GET",
    preventLoading: true,
    loginRequired: false,
  });
}
