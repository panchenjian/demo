<template>
  <uni-popup ref="showQrCodePopupRef">
    <view class="popup-content">
      <p class="title">{{ props.title || "联系客服，领取福利" }}</p>
      <view class="img-wrapper">
        <image
          class="img"
          :src="appConfig?.mnp?.contact_qr_code"
          mode="aspectFit"
          :show-menu-by-longpress="true"
        ></image>
        <p class="desc">长按识别二维码</p>
      </view>
      <p class="tips">{{ props.tips || "" }}</p>
    </view>
  </uni-popup>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";

const store = useStore();
const appConfig = computed(() => store.state.appConfig || {});

// 定义props
const props = defineProps({
  title: String,
  tips: String,
});

const showQrCodePopupRef = ref(null);
const open = () => {
  showQrCodePopupRef.value?.open("center");
};
const close = () => {
  showQrCodePopupRef.value?.close();
};

// 暴露方法
defineExpose({
  open,
  close,
});
</script>

<style scoped lang="scss">
.popup-content {
  width: 558rpx;
  padding-top: 80rpx;
  padding-bottom: 80rpx;
  text-align: center;
  border-radius: 8px;
  border: 0.5px solid rgba(255, 255, 255, 0.5);
  color: #ffffff;
  align-items: center;
  display: flex;
  flex-direction: column;

  background: linear-gradient(
    155deg,
    #7d7d7d 1.6%,
    rgba(41, 41, 41, 0.67) 39.69%,
    #383838 100.53%
  );
  backdrop-filter: blur(12.850000381469727px);

  .title {
    color: #ff8957;
    text-align: center;
    font-size: 18px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px; /* 100% */
  }

  .img-wrapper {
    width: 100%;
    margin-top: 28px;
    align-items: center;
    display: flex;
    flex-direction: column;

    .img {
      padding: 12px;
      background-color: #ff8957;
      border-radius: 8px;
      width: 163px;
      height: 163px;
    }

    .desc {
      color: rgba(255, 255, 255, 0.5);
      margin-top: 22rpx;
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
      line-height: 18px; /* 112.5% */
    }
  }

  .tips {
    margin-top: 48rpx;
    color: #fff;
    text-align: center;
    font-size: 16px;
    font-style: normal;
    font-weight: 600;
    line-height: 18px; /* 112.5% */
  }
}
</style>
