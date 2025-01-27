<template>
  <ShowQrCode ref="showQrCodePopup" />
  <uni-popup ref="cardCodeInputPopup">
    <view class="popup-dialog">
      <view class="popup-dialog-title">请输入兑换码</view>
      <view class="popup-dialog-input-wrapper">
        <input type="text" class="popup-dialog-input" v-model="cardCode" />
      </view>
      <view v-if="props.showTips" class="recharge_tips">
        {{ `剩余张数不足：${balanceDraw}，请及时兑换` }}
      </view>
      <p class="tips" @tap="$debounceClick(openQrPopup)()">
        🔥限时福利：
        <span class="tips-underscore">{{ "免费领 >>" }}</span>
      </p>
      <view class="bottom">
        <button type="plain" class="cancel-btn" @tap="$debounceClick(close)()">
          取消
        </button>
        <button
          type="plain"
          class="confirm-btn"
          @tap="$debounceClick(onConfirm)()"
        >
          确认兑换
        </button>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useCardCode } from "../api/pay";
import ShowQrCode from "./ShowQrCode.vue";

// Props 定义
const props = defineProps({
  title: String,
  showTips: Boolean,
});

// refs
const showQrCodePopup = ref(null);
const cardCodeInputPopup = ref(null);
const cardCode = ref("");

// store
const store = useStore();

// computed
const balanceDraw = computed(() => {
  return store.state.userInfo?.balance_draw || 0;
});

// methods
const open = () => {
  cardCode.value = "";
  cardCodeInputPopup.value?.open("center");
};

const close = () => {
  cardCodeInputPopup.value?.close();
};

const openQrPopup = () => {
  close();
  showQrCodePopup.value?.open();
};

const closeQrPopup = () => {
  showQrCodePopup.value?.close();
};

const onConfirm = async () => {
  if (!cardCode.value) {
    uni.showToast({
      title: "请输入兑换码",
      icon: "none",
    });
    return;
  }

  const sn = cardCode.value;
  uni.showLoading({
    title: "兑换中...",
  });

  try {
    const res = await useCardCode({ sn });
    if (res.code !== 1) {
      uni.hideLoading();
      uni.showToast({
        title: res.msg || "服务器错误",
        icon: "none",
      });
      return;
    }

    setTimeout(async () => {
      try {
        await store.dispatch("fetchUserInfo");
        cardCode.value = "";
        uni.hideLoading();
        close();
        uni.showToast({
          title:
            "兑换成功🎉" +
            (res?.data?.draw_num ? "余额+" + res.data.draw_num : ""),
          icon: "none",
        });
      } catch (err) {
        uni.hideLoading();
        uni.showToast({
          title: "兑换失败，请联系客服",
          icon: "none",
        });
      }
    }, 1000);
  } catch (err) {
    uni.hideLoading();
    uni.showToast({
      title: "兑换失败，请联系客服",
      icon: "none",
    });
  }
};

// 暴露方法给父组件
defineExpose({
  open,
  close,
  openQrPopup,
  closeQrPopup,
});
</script>

<style scoped lang="scss">
@import "@/common/variable.scss";
.popup-dialog {
  border-radius: 8px;
  border: 1px solid #5e4e7d;
  background: linear-gradient(
    239deg,
    rgba(58, 49, 76, 0.89) 0%,
    rgba(62, 51, 83, 0.89) 21.89%,
    rgba(80, 66, 109, 0.89) 50.05%,
    rgba(47, 40, 64, 0.89) 73.57%,
    rgba(27, 23, 36, 0.89) 100%
  );
  backdrop-filter: blur(9.25px);
  display: flex;
  flex-direction: column;
  width: 594rpx;
  color: #fff;
  padding-top: 94rpx;
  padding-bottom: 58rpx;
  justify-content: center;
  align-items: center;

  .popup-dialog-title {
    width: 100%;
    justify-content: center;
    align-items: center;
    display: flex;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px;
    letter-spacing: 0px;
  }

  .popup-dialog-input-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 46rpx;

    .popup-dialog-input {
      width: 442rpx;
      height: 70rpx;
      flex-shrink: 0;
      border-radius: 4px;
      background: #fff;
      color: black;
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
      line-height: 18px; /* 112.5% */
      text-align: center;
      border-radius: 8px;
    }
  }

  .bottom {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    width: 442rpx;
    margin-top: 36rpx;

    button {
      color: #fff;
      text-align: center;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 18px; /* 128.571% */
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 0;
    }

    .confirm-btn {
      background: $primary-button-color;
      border-radius: 8px;
      width: 214rpx;
      height: 72rpx;
    }

    .cancel-btn {
      background: transparent;
      border-radius: 8px;
      border: 1px solid $primary-button-color;
      width: 214rpx;
      height: 72rpx;
    }
  }

  .tips {
    color: $primary-button-color;
    font-family: "PingFang SC";
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px; /* 128.571% */
    margin-top: 100rpx;
  }

  .tips-underscore {
    text-decoration-line: underline;
  }

  .recharge_tips {
    margin-top: 12px;
    color: rgba(255, 255, 255, 0.43);
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    line-height: 20px; /* 166.667% */
    letter-spacing: -0.5px;
  }
}
</style>

<style scoped lang="scss">
@import "@/common/variable.scss";
.popup-dialog {
  border-radius: 8px;
  border: 1px solid #5e4e7d;
  background: linear-gradient(
    239deg,
    rgba(58, 49, 76, 0.89) 0%,
    rgba(62, 51, 83, 0.89) 21.89%,
    rgba(80, 66, 109, 0.89) 50.05%,
    rgba(47, 40, 64, 0.89) 73.57%,
    rgba(27, 23, 36, 0.89) 100%
  );
  backdrop-filter: blur(9.25px);
  display: flex;
  flex-direction: column;
  width: 594rpx;
  color: #fff;
  padding-top: 94rpx;
  padding-bottom: 58rpx;
  justify-content: center;
  align-items: center;

  .popup-dialog-title {
    width: 100%;
    justify-content: center;
    align-items: center;
    display: flex;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px;
    letter-spacing: 0px;
  }

  .popup-dialog-input-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 46rpx;

    .popup-dialog-input {
      width: 442rpx;
      height: 70rpx;
      flex-shrink: 0;
      border-radius: 4px;
      background: #fff;
      color: black;
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
      line-height: 18px; /* 112.5% */
      text-align: center;
      border-radius: 8px;
    }
  }

  .bottom {
    display: flex;
    justify-content: space-between;
    font-size: 16px;
    width: 442rpx;
    margin-top: 36rpx;

    button {
      color: #fff;
      text-align: center;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 18px; /* 128.571% */
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0;
      padding: 0;
    }

    .confirm-btn {
      background: $primary-button-color;
      border-radius: 8px;
      width: 214rpx;
      height: 72rpx;
    }

    .cancel-btn {
      background: transparent;
      border-radius: 8px;
      border: 1px solid $primary-button-color;
      width: 214rpx;
      height: 72rpx;
    }
  }

  .tips {
    color: $primary-button-color;
    font-family: "PingFang SC";
    font-size: 14px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px; /* 128.571% */
    margin-top: 100rpx;
  }

  .tips-underscore {
    text-decoration-line: underline;
  }

  .recharge_tips {
    margin-top: 12px;
    color: rgba(255, 255, 255, 0.43);
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    line-height: 20px; /* 166.667% */
    letter-spacing: -0.5px;
  }
}
</style>
