import request, { baseUrl, requireLogin } from "../utils/request";

export function getOrderList(data) {
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
    url: "/order",
    method: "GET",
    data:{...data,size:20},
    header: header,
  });
}

//创建制作订单
export function submitProdOrder(data) {
  const token = uni.getStorageSync("token");
  return request({
    url: "/order",
    method: "POST",
    data,
    header: { Authorization: token },
  });
}

//通过地址计算价格
export function getExpressPrice(address_uuid) {
  const token = uni.getStorageSync("token");
  return request({
    url: "/order/cal",
    method: "POST",
    data:{address_uuid},
    header: { Authorization: token },
  });
}
//重新支付
export function payAgainOrder(order_no){
	const token = uni.getStorageSync("token");
	return request({
	  url: "/order/repay",
	  method: "POST",
	  data:{order_no},
	  header: { Authorization: token },
	});
}
//修改订单地址
export function updateOrderAddress(order_no,address_uuid){
	const token = uni.getStorageSync("token");
	return request({
	  url: "/order/update/address",
	  method: "POST",
	  data:{order_no,address_uuid},
	  header: { Authorization: token },
	});
}
//关闭订单
export function cancelOrder(order_no){
	const token = uni.getStorageSync("token");
	return request({
	  url: `/order/close/${order_no}`,
	  method: "PUT",
	  //data:{order_no},
	  header: { Authorization: token },
	});
}
//订单详情
export function getOrderDetail(order_no) {
  const token = uni.getStorageSync("token");
  return request({
    url: `/order/detail/${order_no}`,
    method: "GET",
    //data:{order_no},
    header: { Authorization: token },
  });
}
//获取订单物流信息
export function getExpressDetail(order_no) {
  const token = uni.getStorageSync("token");
  return request({
    url: `/express/detail/${order_no}`,
    method: "GET",
    //data:{order_no},
    header: { Authorization: token },
  });
}