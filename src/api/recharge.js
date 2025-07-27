import request from "../utils/request";

export function getRechargePackage(data) {
  return request({
    url: "/api/recharge/package",
    method: "GET",
    preventLoading: true,
    data,
  });
}

export function getRechargeOrders() {
  return request({
    url: "/api/recharge/orderList",
    method: "GET",
  });
}

export function submitRechargeOrder(data) {
  return request({
    url: "/api/recharge/recharge",
    method: "POST",
    data,
  });
}
//创建会员次数下单订单
export function submitVipOrder(data) {
  const token = uni.getStorageSync("token");
  return request({
    url: "/order/member/times",
    method: "POST",
    data,
    header: { Authorization: token },
  });
}
export function getVipMembers() {
  return request({
    url: "/system/member",
    method: "GET",
  });
}
