<template>
  <view class="content">
    <image
      class="mask-img"
      mode="aspectFill"
      src="/static/primary-background.png"
    ></image>
    <view class="total-pkg-wrapper">
      <view class="pkg-list">
        <view
          class="pkg-item"
          v-for="(pkg, index) in packageList"
          :key="index"
          :class="{ active: pkg.id == selectedItem?.id }"
          @tap="onSelectPricePlan(pkg)"
        >
          <view class="top-wrapper">{{ pkg.name }}</view>
          <view class="bottom-wrapper">{{ pkg.describe }}</view>
          <view class="price-text">{{ "￥" + pkg.sell_price }}</view>
        </view>
      </view>
    </view>
    <view class="tips bottom-tips">
      <view class="info">
        <view class="pkg-member-end-time">
          当前余额：
          <text>{{ userInfo?.balance_draw || 0 }}</text>
        </view>
      </view>
      <view @tap="$debounceClick(onClickCardCode)()">
        🎁
        <span class="right-btn">我有兑换码</span>
      </view>
    </view>
    <view class="main-btn-wrap">
      <button
        type="plain"
        class="main-btn"
        @tap="$debounceClick(onRechargeBtnClick)()"
      >
        确认购买
      </button>
    </view>
    <CardCodeInput ref="cardCodeInputPopup" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import { setTopNavBar2DarkTheme } from "../../utils/common";
import { getRechargePackage, submitRechargeOrder } from "../../api/recharge";
import { queryPayStatus, requestPrepay } from "../../api/pay";
import CardCodeInput from "../../components/CardCodeInput.vue";

// store
const store = useStore();

// refs
const cardCodeInputPopup = ref(null);

const selectedItem = ref(null);
const intervalId = ref(null);
const pollingFinished = ref(false);

// 充值套餐列表
const packageList = ref([]);
getRechargePackage().then((res) => {
  packageList.value = res.data;
  selectedItem.value = packageList.value[0];
});

store.dispatch("fetchUserInfo");
const userInfo = computed(() => store.state.userInfo || {});

// methods
const onClickCardCode = () => {
  cardCodeInputPopup.value?.open();
};

const onSelectPricePlan = (item) => {
  selectedItem.value = item;
};

const onRechargeBtnClick = () => {
  submitOrder();
};

const showLoadingOverlay = async (orderID, from = "recharge") => {
  pollingFinished.value = false;
  uni.showLoading({ title: "确认支付结果中" });

  intervalId.value = setInterval(async () => {
    try {
      const res = await queryPayStatus({ order_id: orderID, from });
      if (res.code !== 1) {
        throw new Error(res.msg || "服务器开小差了");
      }

      if (res.data.pay_status === 1) {
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
    const orderRes = await submitRechargeOrder({
      package_id: selectedItem.value.id,
      money: selectedItem.value.sell_price,
    });
    if (orderRes.code !== 1) {
      throw new Error(orderRes.msg || "服务器开小差了");
    }

    const orderID = orderRes.data.order_id;
    const payRes = await requestPrepay({
      order_id: orderID,
      from: "recharge",
      pay_way: 2, // 微信小程序支付
      redirect: "/",
    });

    if (payRes.code !== 1) {
      throw new Error(payRes.msg || "服务器开小差了");
    }

    // #ifdef MP-WEIXIN
    uni.requestPayment({
      provider: "wxpay",
      ...payRes.data.config,
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

onMounted(() => {
  setTopNavBar2DarkTheme("#3f2d64");
});

onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});
</script>

<style scoped>
/* 保持原有样式不变 */
</style>

<style lang="scss" scoped>
@import "@/common/variable.scss";

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  position: relative;
  overflow-y: scroll;
  min-height: 100%;

  font-size: 16px;
  font-weight: 600;
  line-height: normal;
  padding: 22px 40rpx 0;
}

.mask-img {
  position: absolute;
  z-index: -1;
  left: 0;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
}

.total-pkg-wrapper {
  width: 100%;
  margin-bottom: 0;

  .pkg-item {
    position: relative;
    min-height: 100px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: center;
    padding: 16px 32rpx 14px;
    background: #382c4d;
    border-radius: 8px;
    box-sizing: border-box;
    border: 1.8px solid transparent;
    .recommend-tag {
      position: absolute;
      padding: 3px 20rpx;
      background: #ff5a9f;
      color: #fff;
      font-size: 9px;
      font-weight: 600;
      line-height: 12px;
      border-radius: 30px;
      right: 32rpx;
      top: 0;
      transform: translate(0, -50%);
    }
    .top-wrapper {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      line-height: normal;
    }
    .bottom-wrapper {
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
      font-weight: 400;
      line-height: normal;
    }
    .number-text {
      position: absolute;
      display: none;
    }
    .unit-text {
      position: absolute;
      display: none;
    }
    .price-text {
      position: absolute;
      display: flex;
      align-items: flex-end;
      top: 20px;
      right: 32rpx;
      color: $primary-button-color;
      text-align: center;
      font-size: 18px;
      font-weight: 600;
      line-height: 20px; /* 71.429% */

      text {
        font-size: 12px;
      }

      image {
        position: absolute;
        width: 14px;
        height: 10px;
        bottom: 0;
        right: 0;
        transform: translate(70%, 60%);
      }
    }
    .number-of-images {
      position: absolute;
      bottom: 15px;
      right: 32rpx;
      color: #fff;
      text-align: center;
      font-size: 11px;
      font-weight: 400;
      line-height: normal;
    }
    .original-text {
      position: absolute;
      bottom: -20px;
      right: 0;
      transform: translate(100%, 0);
      color: #fff;
      text-align: center;
      font-size: 14px;
      font-weight: 600;
      line-height: 20px; /* 142.857% */
      text-decoration-line: strikethrough;
    }
  }
  .active {
    border: 1.8px solid $primary-button-color;
    background: #251e33;
  }
}

.tips {
  color: #999;
  text-align: center;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 20px; /* 166.667% */
  letter-spacing: -0.5px;
}

.price-tips {
  text {
    margin-left: 8rpx;
    color: $main-button-color;
  }
}

.bottom-tips {
  margin-top: 20rpx;
  display: flex;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;

  .info {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    flex-direction: column;
    padding-top: 2px;
    gap: 6px;

    .pkg-member-end-time {
      color: rgba(255, 255, 255, 0.64);

      text-align: center;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 133.333% */
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;

      text {
        color: #ff5a9f;
        text-align: center;
        font-size: 16px;
        font-weight: 600;
        line-height: 16px; /* 100% */
        letter-spacing: -0.5px;
      }
    }

    .pkg-info {
      color: rgba(255, 255, 255, 0.64);
      text-align: center;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 133.333% */
      letter-spacing: -0.5px;
      display: flex;
      align-items: flex-start;
    }
  }

  .right-btn {
    color: #ff3495;
    text-align: center;
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: 20px; /* 133.333% */
    letter-spacing: -0.5px;
    text-decoration-line: underline;
    margin-left: 3px;
  }
}

.main-btn-wrap {
  width: calc(100vw - 80rpx);
  margin-top: 20px;
  margin-bottom: 80px;

  .main-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 90rpx;
    width: 100%;
    border-radius: 8px;
    background: $primary-button-color;
    color: #fff;
    text-align: center;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 13px;
    text-align: center;
  }
}
</style>
