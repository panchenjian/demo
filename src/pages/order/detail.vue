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
            <view class="placeOne">{{ detail.address_info.address }}</view>
            <view class="placeTwo">
              {{ detail.address_info.reveiver }} {{ detail.address_info.phone }}
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
          <view>
            <image
              :src="`/static/step${index + 1}.png`"
              class="stepIcon"></image>
            <view :class="stepActive >= index ? 'acitve' : 'not-active'">
              {{ item.title }}
            </view>
          </view>
        </view>
      </view>

      <view class="shuoming">
        <image :src="detail?.cover" class="shuomingImg"></image>
      </view>
    </view>
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
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
// import VTabs from "@/uni_modules/v-tabs/components/v-tabs/v-tabs";
import { getOrderDetail } from "../../api/order.js";
import { timeFormat } from "@/utils/common.js";

const store = useStore();

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
let orderId;
const onBack = () => {
  uni.navigateBack();
};
// 页面生命周期钩子
onLoad((option) => {
  if (option.id) {
    orderId = option.id;
    getOrderDetail(option.id).then((res) => {
      detail.value = res.data;
      stepActive.value = res.data.order_status > 4 ? 1 : res.data.order_status;
    });
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
  line-height: 54rpx !important;
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
