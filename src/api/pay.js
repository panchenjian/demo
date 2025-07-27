import request from "../utils/request";
import { miniProgramAppID } from "./user";

export function requestPrepay(data) {
  data.appid = miniProgramAppID;
  return request({
    url: "/api/pay/prepay",
    method: "POST",
    data,
  });
}
//获取支付结果
export function queryPayStatus(order_no) {
  const token = uni.getStorageSync("token");
  return request({
    url: `/pay/result/${order_no}`,
    method: "GET",
    preventLoading: true,
    header: { Authorization: token },
  });
}

export function useCardCode(data) {
  return request({
    url: "/api/pay/useCardCode",
    method: "POST",
    data,
  });
}
