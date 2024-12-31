import request from "../utils/request";

export function getGroupList(data) {
  return request({
    url: "/api/swap_template/group_list",
    method: "GET",
    preventLoading: true,
    loginRequired: false,
    data,
  });
}
