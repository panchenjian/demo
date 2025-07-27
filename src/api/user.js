import request, { baseUrl, requireLogin } from "../utils/request";
export const miniProgramAppID = uni.getAccountInfoSync
  ? uni.getAccountInfoSync().miniProgram.appId
  : "";

export function getUserInfo(loginParam) {
	const token = uni.getStorageSync("token");
	// 如果存在 token，则将其添加到请求头中
	let header;
	if (token) {
	  header = { Authorization:token };
	} else {
	  requireLogin();
	  return Promise.reject(new Error("No token found"));
	}
	
  return request({
    url: "/user/info",
    method: "POST",
	header:header,
    preventLoading: true,
    loginParam,
  });
}

// 微信小程序登录
export function mnpLogin(data) {
  data.appid = miniProgramAppID;
  return request({
    url: "/user/wx/token",//api/login/mnpLogin",
    method: "POST",
    data,
    loginRequired: false,
  });
}

export function submitFeedback(data) {
  return request({
    url: "/api/feedback/add",
    method: "POST",
    data,
  });
}

export function uploadCommonImage(filePath) {
  const token = uni.getStorageSync("token");

  // 如果存在 token，则将其添加到请求头中
  let header;
  if (token) {
    header = { token };
  } else {
    requireLogin();
    return Promise.reject(new Error("No token found"));
  }

  return uni.uploadFile({
    url: `${baseUrl}/api/upload/image`,
    filePath: filePath,
    name: "file",
    header: header,
  });
}
export function getVipCount(filePath) {
  const token = uni.getStorageSync("token");

  // 如果存在 token，则将其添加到请求头中
  let header;
  if (token) {
    header = { Authorization:token };
  } else {
    requireLogin();
    return Promise.reject(new Error("No token found"));
  }

  return request({
    url: "/user/generate/number",
    method: "GET",
    
    header: header,
  });
}
//获取自己的作品列表
export function getMyResult(page,category){
	const token = uni.getStorageSync("token");
	return request({
		url:"/production/self",
		method: "GET",
		data:{page,size:20,category},
		header: { Authorization:token },
	})
}