<template>
  <!-- <view class="box-bg" >
		<uni-nav-bar background-color="transparent" left-icon="left" title="开通会员" @clickLeft="back" />
	</view> -->
  <view class="nav-transp">
    <text
      class="tn-icon-left"
      style="font-size: 50rpx"
      @tap="$debounceClick(onBack)()"></text>
    <text class="nav-title">开通会员</text>
    <text class="w50"></text>
  </view>
  <view class="content">
    <image src="/static/VIPBaner.png" class="vipBanner"></image>
    <view class="tab-body">
      <view class="cardList">
        <view class="default-cardBox padding32">
          <view class="card-title">充值会员</view>
          <view
            :class="'card-item ' + (current === index ? 'selected' : '')"
            v-for="(item, index) in cards"
            @tap="$debounceClick(changeTab)(index)"
            :key="index">
            <view class="card-head">
              {{ item.name }}
            </view>
            <view class="card-price">
              ￥
              <text class="txtBigBig">{{ item.price }}</text>
            </view>
            <view class="card-av">{{ item.av }}/次</view>
          </view>
        </view>
        <view class="default-cardBox tips-btn">
          <image src="/static/Vector.png" class="buyTipImg"></image>
          <text class="buyTipTxt">定制手办免费获得生成次数</text>
          <view class="btn-main-text1">去定制</view>
          <view class="btn-main-text2">(成功定制赠送3次)</view>
        </view>
      </view>
      <view class="fixedView">
        <button
          class="button name-btn-big"
          type="default"
          @tap="$debounceClick(onRechargeBtnClick)()">
          立即开通
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import {
  getRechargePackage,
  submitRechargeOrder,
  getVipMembers,
  submitVipOrder,
} from "../../api/recharge";
import { queryPayStatus, requestPrepay } from "../../api/pay";
import { onLoad, onShow, onUnload } from "@dcloudio/uni-app";
const store = useStore();

const pollingFinished = ref(false);
const intervalId = ref(null);
const current = ref(1);
const cards = ref([
  { name: "单次生成卡", price: 1.0, av: 1.0 },
  { name: "10次生成卡", price: 7.0, av: 0.7 },
  { name: "100次生成卡", price: 50.0, av: 0.5 },
]);
const changeTab = (index) => {
  current.value = index;
};
const onBack = () => {
  uni.navigateBack();
};
const onRechargeBtnClick = () => {
  submitOrder();
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
        !pollingFinished.value && onPaySuccess();
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
  }, 800);
};

const onPaySuccess = async () => {
  await store.dispatch("fetchUserInfo");

  uni.showToast({
    title: "充值成功！",
    duration: 2000,
    mask: true,
  });

  setTimeout(() => {
    uni.navigateBack();
  }, 2000);
};
const submitOrder = async () => {
  try {
    const orderRes = await submitVipOrder({
      uuid: cards.value[current.value].uuid,
    });
    if (orderRes.code !== 20000) {
      throw new Error(orderRes.msg || "服务器开小差了");
    }
    //pay_url  order_no
    //const orderID = orderRes.data.order_no;
    // const payRes = await requestPrepay({
    //   order_id: orderID,
    //   from: "recharge",
    //   pay_way: 2, // 微信小程序支付
    //   redirect: "/",
    // });

    // if (payRes.code !== 1) {
    //   throw new Error(payRes.msg || "服务器开小差了");
    // }
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

onLoad((option) => {
  getVipMembers().then((res) => {
    cards.value = res.data.items.map((x) => {
      return {
        name: (x.times === 1 ? "单" : x.times) + "次生成卡",
        price: x.price,
        av: (x.price / x.times).toFixed(2),
        uuid: x.uuid,
      };
    });
  });
});
</script>

<style lang="scss" scoped>
@import "@/common/variable.scss";
@import "@/common/main.scss";
.content {
  height: calc(100vh - 60px);
  overflow: auto;
  background: linear-gradient(180deg, #f6ebfe 0%, #f7f7f7 100%);
}
.txtBigBig{
	font-weight: 500;
	font-size: 44rpx;
	
	line-height: 30rpx;
}
.tab-body {
  background: #f7f7f7;
  border-radius: 60rpx 60rpx 0 0;
  padding-top: 32rpx;
}
.vipBanner {
  width: 686rpx;
  height: 240rpx;
  margin-left: 30rpx;
  margin-top: 150rpx;
}
.card-title {
  font-size: 32rpx;
  color: #010204;
  line-height: 78rpx;
}
.card-item {
  background: #f7f7f7;
  border-radius: 24rpx;
  display: inline-block;
  width: 298rpx;
  height: 228rpx;

  margin-bottom: 26rpx;
  &.selected {
    background: #ffffff;
    border: 2rpx solid #010204;
  }
  &:nth-child(even) {
    margin-right: 22rpx;
  }

  .card-head {
    font-size: 28rpx;
    color: #010204;
    line-height: 32rpx;
    text-align: center;
    margin-top: 32rpx;
  }
  .card-price {
    margin-top: 26rpx;
    font-weight: 500;
    font-size: 24rpx;
    color: #ff3b2f;
    line-height: 48rpx;
    text-align: center;
  }
  .card-av {
    margin-top: 28rpx;
    font-weight: 500;
    font-size: 28rpx;
    color: #b077fc;
    line-height: 28rpx;
    text-align: center;
  }
}

.tips-btn {
  height: 156rpx;
  padding-top: 4rpx;
  margin-top: 6rpx;
}
.buyTipImg {
  position: absolute;
  top: -6px;
  left: 16px;
  width: 344rpx;
  height: 54rpx;
}
.buyTipTxt {
  position: absolute;
  top: -6px;
  left: 26px;
  font-size: 24rpx;
  color: #b077fc;
  line-height: 38rpx;
}
.btn-main-text1 {
  font-weight: 800;
  font-size: 36rpx;
  color: #8537ee;
  line-height: 32rpx;
  text-align: center;
  margin-top: 54rpx;
}
.btn-main-text2 {
  font-weight: 400;
  font-size: 28rpx;
  color: #000000;
  line-height: 32rpx;
  text-align: center;
  margin-top: 18rpx;
}
</style>
