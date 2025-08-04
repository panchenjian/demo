<template>
  <view class="content">
    <v-tabs
      v-model="currentTab"
      :tabs="tabs"
      field="name"
      @change="changeTab"
      lineColor="#B37DF5"
      activeColor="#B37DF5"
      width="14%"
      height="100rpx"
      lineHeight="2px"
      lineScale="0.7"></v-tabs>

    <swiper
      class="swiperWrap"
      :current="currentTab"
      height="100%"
      :autoplay="false"
      next-margin="0"
      @change="handleSwiperChange">
      <swiper-item v-for="(group, index) in tabs" :key="index">
        <scroll-view
          class="scroll-view_Y"
          scroll-y="true"
          scroll-with-animation="false"
          :enhanced="true"
          :show-scrollbar="false"
          @scrolltolower="lower(group)">
          <view class="template-wrap">
            <view
              v-for="(template, index) in orderList"
              :key="index"
              class="template-item"
              @tap="$debounceClick(jumpOrderDetail)(template)">
              <view class="orderCard">
                <view class="order-img">
                  <image
                    :src="template.cover"
                    class="template-item-img"></image>
                </view>
                <view class="column-flex flex-1 gap4">
                  <view class="txt1">{{ template.title }}</view>
                  <view class="txt2">{{ template.description }}</view>
                  <view class="tip">不支持7天无理由</view>
                </view>
                <view class="text-right">
                  <view class="chat-custom-text">
                    ￥
                    <text class="txtBig">{{ template.price }}</text>
                  </view>

                  <view>× {{ template.number }}</view>
                </view>
              </view>
              <view
                class="order-wuliu-status"
                v-if="[2, 3].includes(template.order_status)">
                <image
                  :src="
                    template.order_status === 2
                      ? '/static/hourglass.png'
                      : '/static/from.png'
                  "
                  class="staImg"></image>
                <text class="txt3">
                  {{
                    template.order_status === 2 ? "手办制作中" : "手办已发货"
                  }}
                </text>
              </view>
              <view
                :class="`height58 space-b-flex ${
                  [2, 3].includes(template.order_status)
                    ? 'marginTop24'
                    : 'marginTop48'
                }`">
                <view class="pay-info">
                  <text>
                    <text class="txtBig">
                      {{
                        template.order_status === 1
                          ? "待付款"
                          : template.order_status === 5
                          ? "总金额"
                          : "实付款"
                      }}
                    </text>
                    <text>
                      ￥
                      <text class="txtBig">{{ template.price }}</text>
                    </text>
                  </text>
                </view>
                <view class="template-desc">
                  <view class="text-right" v-if="template.order_status === 1">
                    <button
                      class="mini-btn orderBtn-default"
                      type="default"
                      size="mini"
                      @tap.stop="$debounceClick(cancel)(template)">
                      取消订单
                    </button>
                    <button
                      class="mini-btn orderBtn-parimy marginLeft12"
                      type="default"
                      @tap.stop="$debounceClick(payIt)(template)"
                      size="mini">
                      立即付款
                    </button>
                  </view>
                  <view class="text-right" v-if="template.order_status === 2">
                    <button
                      class="mini-btn orderBtn-default"
                      type="default"
                      size="mini"
                      @tap.stop="$debounceClick(quickPost)(template)">
                      催发货
                    </button>
                    <button
                      class="mini-btn orderBtn-parimy marginLeft12"
                      type="default"
                      @tap.stop="$debounceClick(goChangeAddress)(template)"
                      size="mini">
                      修改地址
                    </button>
                  </view>
                  <view class="text-right" v-if="template.order_status === 3">
                    <button
                      class="mini-btn orderBtn-default"
                      type="default"
                      size="mini"
                      @tap.stop="$debounceClick(goProcess)(template)">
                      查看进度
                    </button>
                    <button
                      class="mini-btn orderBtn-parimy marginLeft12"
                      type="default"
                      @tap.stop="$debounceClick(goExpress)(template)"
                      size="mini">
                      查看物流
                    </button>
                  </view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
  <uni-popup
    ref="kefuPopup"
    type="bottom"
    background-color="#fff"
    border-radius="10px 10px 0 0">
    <view class="popup-content">
      <view class="txtBig">
        微信扫描二维码添加客服咨询
        <icon type="clear" class="closeIcon" @tap="closeKeF"></icon>
      </view>
      <image
        src="https://img2.baidu.com/it/u=3165004975,3909462601&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=501"
        mode=""></image>
    </view>
  </uni-popup>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { AblumStore, AblumType } from "../../store/album";
//import VTabs from "@/uni_modules/v-tabs/components/v-tabs/v-tabs";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import { getOrderList, payAgainOrder, cancelOrder } from "../../api/order.js";
import { queryPayStatus } from "../../api/pay";

const store = useStore();

const intervalId = ref(null);
const pollingFinished = ref(false);
const currentTab = ref(0);
const tabs = ref([
  { id: "", name: "全部订单", disabled: false },
  { id: 1, name: "待支付", disabled: false },
  { id: 2, name: "制作中", disabled: false },
  { id: 3, name: "已发货", disabled: true },
  { id: 4, name: "已完成", disabled: false },
]);
const kefuPopup = ref();
const changeTab = (index) => {};

const orderList = computed(
  () => store.state.orderList[currentTab.value]?.list || []
);

const jumpOrderDetail = (template) => {
  uni.navigateTo({
    url: "/pages/order/detail?id=" + template.order_no,
  });
};
const getBanner = (id = "", page = 1, order_status = "") => {
  getOrderList({ id, page, order_status }).then((res) => {
    // let tmp = [
    //   {
    //     order_no: "7df0a3c7ca3c97a5252f2217fc708603d586a946",
    //     title: "定制手办",
    //     order_status: 3,
    //     description: "【DIY材料】仅白膜,6cm",
    //     price: 29,
    //     number: 1,
    //     cover:
    //       "https://img.zolimarket.com/6dfd849a-30c4-4894-b338-41ae39559139.png",
    //     express_info: {
    //       express_no: "",
    //       express_company: "",
    //     },
    //     total_price: 30,
    //   },
    // ]; //res.data.items
    let tmp = res.data.items;
    store.commit("setOrderListByUuid", { id: id, page, data: tmp });
  });
};
const getListByUuid = async (id = "", page = 1, order_status = "") => {
  //原本id是来自tab的id，order_status是后端要的状态，目前两者相等
  await store.dispatch("fetchOrderList", { id, page, order_status });
};
const lower = (group) => {
  getListByUuid(group.uuid, group.curPage + 1);
};

onLoad(async () => {
  getBanner();
});

const handleSwiperChange = (current) => {
  const nextPage = current.detail.current;
  currentTab.value = nextPage;
  const groupId = tabs.value[nextPage].id;

  getListByUuid(groupId, 1, groupId);
};

const showLoadingOverlay = async (orderID) => {
  pollingFinished.value = false;
  uni.showLoading({ title: "确认支付结果中" });

  intervalId.value = setInterval(async () => {
    try {
      const res = await queryPayStatus(orderID);
      if (res.code !== 20000) {
        throw new Error(res.msg || "服务器开小差了");
      }

      if (res.data.order_status === 2) {
        clearInterval(intervalId.value);
        uni.hideLoading();
        !pollingFinished.value && onPaySuccess(orderID);
        pollingFinished.value = true;
      }
    } catch (error) {
      clearInterval(intervalId.value);
      uni.hideLoading();
      pollingFinished.value = true;
      uni.showToast({
        title: error.message,
        icon: "none",
      });
    }
  }, 1800);
};

const onPaySuccess = async (orderID) => {
  await store.dispatch("fetchUserInfo");
  uni.navigateTo({
    url: "/pages/order/result?orderId=" + orderID,
  });
  // uni.showToast({
  //   title: "支付成功！",
  //   duration: 2000,
  //   mask: true,
  // });

  // setTimeout(() => {
  //   uni.navigateBack();
  // }, 2000);
};

const payIt = async (item) => {
  AblumStore.setImageList(store, [
    new AblumType.ImageItem({
      result_image: item.cover,
      template_name: item.title,
    }),
  ]);

  try {
    let orderRes = await payAgainOrder(item.order_no);

    const {
      order_no: orderID,
      app_id,
      nonce_str,
      package: req_package,
      pay_url,
      time_stamp,
      pay_sign,
      sign_type,
    } = orderRes.data;
    const payResConfig = {
      //"orderInfo": {
      appid: app_id, // 微信开放平台 - 应用 - AppId，注意和微信小程序、公众号 AppId 可能不一致
      nonceStr: nonce_str, // 随机字符串
      package: req_package, // 固定值
      prepayid: pay_url, // 统一下单订单号
      timeStamp: time_stamp, // 时间戳（单位：秒）
      paySign: pay_sign,
      signType: sign_type, // 签名，这里用的 MD5/RSA 签名
      // },
    };

    // #ifdef MP-WEIXIN
    uni.requestPayment({
      provider: "wxpay",
      ...payResConfig,
      success: () => {
        showLoadingOverlay(orderID);
      },
      fail: (err) => {
        if (err?.errMsg.includes("cancel")) return;
        uni.showToast({
          title: "支付失败" + (err?.errMsg ? "：" + err?.errMsg : ""),
          icon: "none",
        });
      },
    });
    // #endif
  } catch (error) {
    uni.showToast({
      title: error.message,
      icon: "none",
    });
  }
};
const cancel = (item) => {
  // AblumStore.setImageList(store, [
  //   new AblumType.ImageItem({
  //     result_image: item.cover,
  //     template_name: item.title,
  //   }),
  // ]);

  //showLoadingOverlay(item.order_no); //测试支付状态
  // setTimeout(() => {
  //   uni.navigateTo({
  //     url: "/pages/order/result",
  //   });
  // }, 500);
  // return;
  cancelOrder(item.order_no).then((res) => {
    getBanner();
  });
};
//查看物流
const goExpress = (item) => {
  uni.navigateTo({
    url: "/pages/order/express?orderId=" + item.order_no,
  });
};
const goProcess = (item) => {};
const quickPost = (item) => {
  openKeF();
};
const goChangeAddress = (item) => {
  uni.navigateTo({
    url: "/pages/address/index?orderId=" + item.order_no,
  });
};
const openKeF = () => {
  kefuPopup.value.open("bottom");
};
const closeKeF = () => {
  kefuPopup.value.close();
};
</script>

<style lang="scss" scoped>
@import "@/common/variable.scss";
@import "@/common/main.scss";

.content {
  height: calc(100vh - 16px);
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
}
.swiperWrap {
  background: #f9f8fa;
  height: 100%;
  padding: 0 30rpx;
}
.height58 {
  height: 58rpx;
}
.scroll-view_Y {
  height: calc(100vh - 114rpx);
}

.scroll-view_Y::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
}

.scroll-view_Y::-webkit-scrollbar-thumb {
  background-color: transparent;
  /* 设置滚动条颜色为透明 */
}
.order-wuliu-status {
  height: 68rpx;
  background: #f9f8fa;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  margin-top: 28rpx;
  .staImg {
    width: 40rpx;
    height: 40rpx;
    margin: 14rpx 20rpx;
  }
  .txt3 {
    font-size: 24rpx;
    color: #000000;
  }
}
.orderBtn-default {
  width: 140rpx;
  height: 58rpx;
  border-radius: 28rpx;
  border: 1rpx solid #999999;
  padding: 0;

  font-size: 24rpx;
  color: #333333;
  line-height: 54rpx;
  text-align: center;
}
.orderBtn-parimy {
  width: 140rpx;
  height: 58rpx;
  border-radius: 28rpx;
  border: 1rpx solid #8537ee;
  padding: 0;

  font-size: 24rpx;
  color: #8537ee;
  line-height: 54rpx;
  text-align: center;
}
</style>
