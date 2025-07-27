import request, { baseUrl, requireLogin } from "../utils/request";
//获取省份信息
export function getCityList(data) {
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
    url: "/system/city",
    method: "GET",
    data,
    header: header,
  });
}

export function createAddress(data) {
  const token = uni.getStorageSync("token");

  return request({
    url: "/user/address",
    method: "POST",
    data,
    header: { Authorization: token },
  });
}
export function updateAddress(data, uuid) {
  const token = uni.getStorageSync("token");

  return request({
    url: `/user/address/${uuid}`,
    method: "PUT",
    data,
    header: { Authorization: token },
  });
}
export function delAddress(uuid) {
  const token = uni.getStorageSync("token");

  return request({
    url: `/user/address/${uuid}`,
    method: "DELETE",
    header: { Authorization: token },
  });
}
//获取地址列表
export function getAddressList(data) {
  const token = uni.getStorageSync("token");

  return request({
    url: `/user/address`,
    method: "GET",
    data: { ...data, size: 20 },
    header: { Authorization: token },
  });
}
//获取地址信息详情
export function getAddressDetail(uuid) {
  const token = uni.getStorageSync("token");

  return request({
    url: `/user/address/${uuid}`,
    method: "GET",
    header: { Authorization: token },
  });
}
//设置为默认地址
export function setDefault(uuid){
	const token = uni.getStorageSync("token");
	
	return request({
	  url: `/user/address/default/${uuid}`,
	  method: "PATCH",
	  header: { Authorization: token },
	});
}