<template>
  <view class="">
    <view class="logistics-container">
      <view
        class="logistics-item"
        v-for="(item, index) in options"
        :key="index"
        :class="index === 0 ? 'active' : ''">
        <view class="line-container">
          <view class="dot"></view>
          <view class="line" v-if="index !== options.length - 1"></view>
        </view>
        <view class="info-container">
          <text class="context">{{ item.context }}</text>
          <text class="time">{{ item.ftime }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
//import ShangjiuSteps from "../../components/JiuSteps.vue";
import { getExpressDetail } from "../../api/order";


const options = ref([]);
onLoad((param) => {
  if (param.orderId) {
    getExpressDetail(param.orderId).then((res) => {
      if (res.code === 20000) {
        options.value = res.data.items;
      }
    });
  }
});
</script>

<style scoped lang="scss">
.logistics-container {
  display: flex;
  flex-direction: column;
  padding: 20rpx;
  position: relative;

  .logistics-item {
    display: flex;
    align-items: flex-start;
    position: relative;

    .line-container {
      margin-top: 57rpx;
      width: 40rpx;
      display: flex;
      flex-direction: column;
      align-items: center;

      .dot {
        width: 10rpx;
        height: 10rpx;
        border-radius: 100%;
        background-color: #9a9a9a;
        margin-top: 10rpx;
        z-index: 2;
      }

      .line {
        margin-top: 24rpx;
        position: absolute;
        border: 2rpx dashed #dddddd;
        height: 100%;
      }
    }

    .info-container {
      flex: 1;
      padding-left: 20rpx;
      margin-top: 57rpx;

      .time {
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 24rpx;
        color: #333333;
        font-style: normal;
      }

      .context {
        display: -webkit-box;
        /* 启用弹性盒子布局 */
        -webkit-box-orient: vertical;
        /* 纵向排列 */
        -webkit-line-clamp: 2;
        /* 限制最多2行 */
        overflow: hidden;
        /* 超出部分隐藏 */
        text-overflow: ellipsis;
        /* 超出显示省略号 */
        word-break: break-word;
        /* 允许长单词换行 */
        font-family: PingFang SC, PingFang SC;
        font-weight: 400;
        font-size: 28rpx;
        color: #999999;
        font-style: normal;
      }
    }
  }

  // .logistics-item:first-child {
  //   .line-container {
  //     margin-top: 0;
  //   }
  // }

  .active {
    .dot {
      width: 16rpx !important;
      height: 16rpx !important;
      border-radius: 100%;
      background-color: #b37df5 !important;
    }

    .time {
      color: #333333 !important;
    }

    .context {
      color: #333333 !important;
    }
  }
}
</style>
