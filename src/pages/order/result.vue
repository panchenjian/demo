<template>
  <view class="content">
    <image src="/static/success_icon.png" class="resultIcon"></image>
    <view class="resultTxt">支付成功</view>
    <view class="name-btn-mid0" @tap="$debounceClick(goOrder)()">查看订单</view>
    <text class="lineText" @tap="$debounceClick(goHome)()">返回首页</text>
    <view class="">
      <image :src="resultImageList[0]?.result_image" class="img"></image>
      <view class="toolBar">
        <view class="toolBarItemWrap1">
          <button class="btnWrap" open-type="share">
            <!-- <image :src="blackShareIcon"></image> -->
            <text class="stxt1">
              {{ t("draw-detail.share-btn") }}
            </text>
          </button>
        </view>
        <view
          class="toolBarItemWrap2"
          @tap="
            $debounceClick(onSavresultImageListeImage)([[0]?.result_image])
          ">
          <!-- <image :src="blackDownloadIcon"></image> -->
          <text class="stxt2">保存图片</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import { AblumStore, AblumType } from "../../store/album";
import { blackDownloadIcon, blackShareIcon } from "../../common/svgBase64";

const store = useStore();
const { t } = useI18n();
const resultImageList = ref([]);
const hasAlbumWritePermission = ref(true);
const orderID = ref(null);

onLoad(async (param) => {
  if (param.orderId) {
    orderID.value = param.orderId;
  }
  console.log(param.orderId);
  resultImageList.value = AblumStore.getImageList(store);
});

const goHome = () => {
  uni.switchTab({
    url: "/pages/index/index",
  });
};
const goOrder = () => {
  console.log("order=", orderID.value);
  uni.redirectTo({
    url: orderID.value
      ? "/pages/order/detail?id=" + orderID.value
      : "/pages/order/index",
  });
};

const onSaveImage = async (url) => {
  const imageUrl = url;

  // #ifdef MP-WEIXIN
  if (!hasAlbumWritePermission.value) {
    wx.getSetting({
      success(res) {
        const writePhotosAlbum =
          res?.authSetting?.["scope.writePhotosAlbum"] || false;
        if (!writePhotosAlbum) {
          wx.openSetting({
            success(res) {
              if (res?.authSetting?.["scope.writePhotosAlbum"]) {
                hasAlbumWritePermission.value = true;
                requestAuthThenSaveImagesFn(imageUrl);
              } else {
                uni.showToast({
                  icon: "error",
                  title: t("draw-detail.toast-gallery-authorize-access"),
                });
              }
            },
            fail(err) {
              console.log("on openSetting fail = ", err);
              uni.showToast({
                icon: "error",
                title: t("draw-detail.toast-authorization-failed"),
              });
            },
          });
        } else {
          requestAuthThenSaveImagesFn(imageUrl);
        }
      },
      fail(err) {
        console.log("err = ", err);
        uni.showToast({
          icon: "error",
          title: t("draw-detail.toast-authorization-failed"),
        });
      },
    });
  }
  // #endif
  requestAuthThenSaveImagesFn(imageUrl);
};

const requestAuthThenSaveImagesFn = (imagesUrl) => {
  return requestAuthThenSaveImages(imagesUrl)
    .then(() => {
      hasAlbumWritePermission.value = true;
    })
    .catch((err) => {
      console.log("err = ", err);
      hasAlbumWritePermission.value = false;
    });
};
</script>

<style lang="scss" scoped>
.content {
  text-align: center;
}
.resultIcon {
  width: 120rpx;
  height: 120rpx;
  margin-top: 48rpx;
}
.resultTxt {
  font-weight: 800;
  font-size: 40rpx;
  color: #333333;
  line-height: 42rpx;
  margin-top: 28rpx;
}
.lineText {
  font-size: 30rpx;
  color: #cccccc;
  line-height: 42rpx;
  display: block;
  margin-top: 12px;
}
.img {
  width: 686rpx;
  height: 714rpx;
  border-radius: 32rpx;
  margin: 32rpx;
}
.name-btn-mid0 {
  margin: 32rpx auto 0;
  width: 315rpx;
  height: 88rpx;
  background: linear-gradient(90deg, #b9aafc 0%, #8537ee 100%);
  border-radius: 1998rpx 1998rpx 1998rpx 1998rpx;
  font-size: 30rpx;
  color: #ffffff;
  line-height: 88rpx;
  text-align: center;
}
.toolBar {
  display: flex;
  justify-content: space-around;
}

.toolBar image {
  height: 28px;
  width: 28px;
  margin-bottom: 4px;
}

.toolBar text {
  color: #010101;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  line-height: 42rpx;
}

.toolBarItemWrap {
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 0;
}
.toolBarItemWrap1 {
  width: 315rpx;
  height: 88rpx;
  background: #000000;
  border-radius: 1998rpx;
  border: none;

  .stxt1 {
    font-weight: 800;
    font-size: 30rpx;
    color: #ffffff;
    line-height: 88rpx;
    text-align: center;
  }
}
.toolBarItemWrap2 {
  width: 315rpx;
  height: 88rpx;
  border-radius: 46rpx;
  border: 2rpx solid #000000;
  .stxt2 {
    font-weight: 800;
    font-size: 30rpx;
    color: #000;
    line-height: 88rpx;
    text-align: center;
  }
}

.btnWrap {
  display: flex;
  flex-direction: column;
  background-color: transparent;
  padding: 0;
  border: none;
  &:after {
    display: none;
  }
}
</style>
