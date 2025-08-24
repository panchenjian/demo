<template>
  <view class="nav-transp">
    <text
      class="tn-icon-left"
      style="font-size: 50rpx"
      @tap="$debounceClick(onBack)()"></text>
    <text class="nav-title"></text>
    <text class="w50"></text>
  </view>
  <view class="content">
    <image
      src="https://mydolldoll-test.oss-cn-shanghai.aliyuncs.com/2606f2c2-ff7b-47a7-9fc3-5e3566acfa03"
      class="bg"></image>

    <view class="wuliuState">
      <image src="/static/wuliu.png" class="wuliuIcon"></image>
      <text class="text">{{ orderStateCN[detail.order_status] }}</text>
    </view>
    <view class="default-cardBox padding32" @tap="$debounceClick(goExpress)()">
      <view class="placeBox">
        <view class="row-flex">
          <image src="/static/from.png" class="localIcon"></image>
          <view class="">
            <view class="placeOne">【杭州市】快件已发往浙江杭州转运中心</view>
            <!-- <view class="placeTwo">丢丢 15800000000</view> -->
          </view>
        </view>
        <view class="">
          <image src="/static/arrowLine.png" class="arrowLineIcon"></image>
        </view>
      </view>

      <view class="center-flex placeBox">
        <view class="row-flex flex-1">
          <image src="/static/localIcon.png" class="localIcon"></image>
          <view class="">
            <view class="placeOne">{{ detail.address_info?.address }}</view>
            <view class="placeTwo">
              {{ detail.address_info?.reveiver }}
              {{ detail.address_info?.phone }}
            </view>
          </view>
        </view>
        <view class="">
          <image src="/static/arrowLine.png" class="arrowLineIcon"></image>
        </view>
      </view>
    </view>

    <view class="default-cardBox padding32">
      <view class="orderCard">
        <view class="order-img">
          <image :src="detail.cover" class="template-item-img"></image>
        </view>
        <view class="column-flex flex-1 gap4">
          <view class="txt1">{{ detail.title }}</view>
          <view class="txt2">{{ detail.description }}</view>
          <view class="tip">不支持7天无理由</view>
        </view>
        <view class="text-right">
          <view class="chat-custom-text">
            ￥
            <text class="txtBig">{{ detail.price }}</text>
          </view>

          <!-- <view>× {{ detail.number }}</view> -->
        </view>
      </view>
      <view class="" v-if="![1, 5].includes(detail.order_status)">
        <view class="text-right marginTop30">
          <text class="txtBig">实付款：</text>
          ￥
          <text class="txtBig">{{ detail.price }}</text>
        </view>
        <view class="space-right-20">
          <view
            class="button-round-md-main w58"
            @tap="$debounceClick(goExpress)()">
            查看物流
          </view>
          <view class="button-round-md w58">退款</view>
          <view class="button-round-md w58" @tap="openKeF">联系客服</view>
        </view>
      </view>
      <view class="" v-if="[1].includes(detail.order_status)">
        <view class="text-right marginTop30">
          <text class="txtBig">待付款：</text>
          ￥
          <text class="txtBig">{{ detail.price }}</text>
        </view>
        <view class="space-right-20">
          <view class="button-round-md-main w58" @tap="$debounceClick(payIt)()">
            立即付款
          </view>
          <view
            class="button-round-md w58"
            @tap.stop="$debounceClick(cancel)()">
            取消订单
          </view>
          <view class="button-round-md w58" @tap="openKeF">联系客服</view>
        </view>
      </view>
      <view class="space-b-flex center-flex marginTop32">
        <view class="label-gray">订单编号</view>
        <view class="label-value">
          {{ detail.order_no?.slice(0, 19) }}
        </view>
      </view>
      <view class="space-b-flex center-flex">
        <view class="label-gray">创建时间</view>
        <view class="label-value">
          {{ timeFormat(detail.create_at, "yyyy-mm-dd hh:MM:ss") }}
        </view>
      </view>
      <view
        class="space-b-flex center-flex"
        v-if="![1, 5].includes(detail.order_status)">
        <view class="label-gray">发货时间</view>
        <view class="label-value">
          {{ timeFormat(detail.send_at, "yyyy-mm-dd hh:MM:ss") }}
        </view>
      </view>
    </view>

    <image src="/static/stepTitle.png" class="step-title"></image>
    <view class="step-box">
      <view class="line" />
      <view class="step-content">
        <view v-for="(item, index) in list1" :key="index">
          <view @tap="$debounceClick(onTagImg)(index)">
            <image
              :src="`/static/step${index + 1}.png`"
              class="stepIcon"></image>
            <view :class="stepActive >= index ? 'acitve' : 'not-active'">
              {{ item.title }}
            </view>
          </view>
        </view>
      </view>

      <view class="shuoming" @tap="$debounceClick(handleClickImage)()">
        <image :src="stepImg" class="shuomingImg" mode="aspectFill"></image>
      </view>
    </view>
  </view>
  <uni-popup
    ref="kefuPopup"
    type="bottom"
    background-color="#fff"
    border-radius="10px 10px 0 0">
    <view class="popup-content">
      <view class="txtBig space-b-flex lineHeight24">
        微信扫描二维码添加客服咨询
        <icon type="clear" class="closeIcon" @tap="closeKeF"></icon>
      </view>
      <image
        src="https://img2.baidu.com/it/u=3165004975,3909462601&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=501"
        class="margin32 block"></image>
    </view>
  </uni-popup>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import Big from "big.js";
import { osName } from "../../context.js";
import { useI18n } from "vue-i18n";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import { AblumStore, AblumType } from "../../store/album";
import { getOrderDetail, payAgainOrder, cancelOrder } from "../../api/order.js";
import { timeFormat } from "@/utils/common.js";
import { queryPayStatus } from "../../api/pay";

const store = useStore();
const { t } = useI18n();

const current = ref(0);
const stepActive = ref(1),
  list1 = ref([
    {
      title: "用户设计",
    },
    {
      title: "深化设计",
    },
    {
      title: "手办制作",
    },
    {
      title: "用户验收",
    },
  ]);
const orderStateCN = ["", "待支付", "制作中", "已发货", "已完成", "已取消"];
const detail = ref({});
const kefuPopup = ref();
const intervalId = ref(null);
const pollingFinished = ref(false);
const stepImg = ref("");
let orderId;
const onBack = () => {
  uni.navigateBack();
};
const getDetail = (orderId) => {
  getOrderDetail(orderId).then((res) => {
    res.data.price = new Big(res.data.price).div(100);
    detail.value = res.data;
    stepImg.value =
      res.data.production_info.find((x) => x.is_current).image_url ||
      res.data.cover;
    stepActive.value = res.data.order_status > 4 ? 1 : res.data.order_status;
  });
};
// 页面生命周期钩子
onLoad((option) => {
  if (option.id) {
    orderId = option.id;
    getDetail(orderId);
  }
});

const goExpress = () => {
  uni.navigateTo({
    url: "/pages/order/express?orderId=" + orderId,
  });
};
const openKeF = () => {
  kefuPopup.value.open("bottom");
};
const closeKeF = () => {
  kefuPopup.value.close();
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
const payIt = async () => {
  AblumStore.setImageList(store, [
    new AblumType.ImageItem({
      result_image: detail.value.cover,
      template_name: detail.value.title,
    }),
  ]);

  try {
    let orderRes = await payAgainOrder(detail.value.order_no);
    //console.log("aaaz", orderRes);
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
const cancel = () => {
  cancelOrder(orderId).then((res) => {
    getDetail(orderId);
  });
};
//切换步骤条，显示对应图片
const onTagImg = (index) => {
  stepImg.value =
    detail.value.production_info[index].image_url || detail.value.cover;
};
const handleClickImage = () => {
  const img = stepImg.value;
  if (osName.value === "android") {
    previewImageonAndriod(img);
  } else {
    uni.previewImage({
      current: 0,
      urls: [img],
    });
  }
};
const previewImageonAndriod = (imageUrl) => {
  uni.showLoading({ title: defaultLoadingTitle });
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: imageUrl,
      success: (e) => {
        uni.previewImage({
          current: e.path,
          urls: [e.path],
        });
        resolve(e.path);
      },
      fail(error) {
        uni.showToast({
          icon: "error",
          title: t("api-toast.load-fail"),
        });
        console.log("加载失败 fail: ", error);
        reject(error);
      },
    });
  }).finally(() => {
    uni.hideLoading();
  });
};
</script>

<style lang="scss" scoped>
@import "@/common/main.scss";
.content {
  height: 100vh; //calc(100vh - 60px);
  overflow: auto;
  position: relative;
  //background: #f9f8fa;
  background: linear-gradient(180deg, #fff 10%, #f6f6f6 100%);
}
.bg {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.popup-content {
  padding: 32rpx;
  position: relative;
  line-height: 33px;
  //height: 60vh;
  //overflow: auto;
}
.w58 {
  width: 140rpx;
  height: 58rpx;
  padding: 0 !important;
  line-height: 56rpx !important;
}
.wuliuState {
  margin-top: 70px;
  margin-bottom: 32rpx;
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;
  .wuliuIcon {
    width: 32rpx;
    height: 32rpx;
    margin-right: 14rpx;
  }
  .text {
    font-weight: 600;
    font-size: 36rpx;
    color: #000000;
    line-height: 50rpx;
  }
}

.step-title {
  width: 144rpx;
  height: 42rpx;
  margin: 0 32rpx 32rpx;
}
.step-box {
  padding-top: 50rpx;
  margin: 0 32rpx;
  .step-content {
    margin-top: -50rpx;
    display: flex;
    justify-content: space-between;
    .active {
      font-size: 28rpx;
      color: #000000;
      text-align: center;
    }
    .not-active {
      font-size: 28rpx;
      color: #999999;
      text-align: center;
    }
  }
}
.line {
  height: 1px;
  background-color: #cabffb;
}
.stepIcon {
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 24rpx;
}
.shuoming {
  text-align: center;
  margin-top: 30px;
  font-size: 28rpx;
  color: #999999;
  .shuomingImg {
    width: 686rpx;
    height: 714rpx;
    border-radius: 32rpx;
  }
}

.label-gray {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 28rpx;
}
.label-value {
  font-size: 24rpx;
  color: #333333;
  line-height: 50rpx;
}
.space-right-20 {
  display: flex;
  gap: 20rpx;
  flex-direction: row-reverse;
  margin-top: 32rpx;
}
.marginTop32 {
  margin-top: 32rpx;
}
.button-round-md {
  display: inline-block;
  //height: 58rpx;
  padding: 18rpx 20rpx;
  border-radius: 28rpx;
  border: 1rpx solid #999999;
  font-size: 24rpx;
  color: #333333;
  line-height: 34rpx;
  text-align: center;
}
.button-round-md-main {
  display: inline-block;
  //height: 58rpx;
  padding: 18rpx 20rpx;
  border-radius: 28rpx;
  border: 1rpx solid #8537ee;
  font-size: 24rpx;
  color: #8537ee;
  line-height: 34rpx;
  text-align: center;
}
</style>
