<template>
  <view class="nav-transp bg-white">
    <text
      class="tn-icon-left"
      style="font-size: 50rpx"
      @tap="$debounceClick(onBack)()"></text>
    <text class="nav-title">支付结果</text>
    <text class="w50"></text>
  </view>
  <view class="content">
    <image src="/static/success_icon.png" class="resultIcon"></image>
    <view class="resultTxt">支付成功</view>
    <view class="name-btn-mid0" @tap="$debounceClick(goOrder)()">查看订单</view>
    <text class="lineText" @tap="$debounceClick(goHome)()">返回首页</text>
    <view class="">
      <image :src="fakeImg" class="img"></image>
      <view class="toolBar">
        <view class="toolBarItemWrap1">
          <button class="btnWrap" @tap="$debounceClick(openShare)()">
            <!-- <image :src="blackShareIcon"></image> -->
            <text class="stxt1">
              {{ t("draw-detail.share-btn") }}
            </text>
          </button>
        </view>
        <view
          class="toolBarItemWrap2"
          @tap="$debounceClick(onSaveImage)([fakeImg])">
          <!-- <image :src="blackDownloadIcon"></image> -->
          <text class="stxt2">保存图片</text>
        </view>
      </view>
      <view :class="`fixedAllView blurFilter ${showShare ? '' : 'hidden'}`">
        <view class="overflowBody">
          <view class="closeIconArea" @tap="$debounceClick(openShare)()">
            <uni-icons
              type="closeempty"
              size="30"
              color="#fff"
              v-if="!share"></uni-icons>
          </view>
          <view class="shareImg">
            <image :src="fakeImg" class="img1" mode="aspectFill"></image>
            <image src="/static/shareMsg.png" class="img2"></image>
            <image
              src="https://mydolldoll-test.oss-cn-shanghai.aliyuncs.com/665ccefa-de00-4382-90a2-d0b0d03fa466"
              class="img3"></image>
          </view>

          <view class="w564">
            <view class="space-b-flex">
              <view class="column-flex">
                <button class="btnWrap icon-3" open-type="share">
                  <image src="/static/f-share.png" class="icon-3" />
                </button>
                <view class="f-text">发送给朋友</view>
              </view>
              <view class="column-flex" @tap="$debounceClick(onShareFriend)()">
                <button class="btnWrap icon-3" open-type="share" id="friend">
                  <image src="/static/f-friend.png" class="icon-3" />
                </button>
                <view class="f-text">分享到朋友圈</view>
              </view>
              <view
                class="column-flex"
                @tap="$debounceClick(onSaveImage)([fakeImg])">
                <image src="/static/f-down.png" class="icon-3"></image>
                <view class="f-text">保存图片</view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { requestAuthThenSaveImages } from "../../utils/common";
import { onLoad, onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
import { AblumStore, AblumType } from "../../store/album";
import { blackDownloadIcon, blackShareIcon } from "../../common/svgBase64";

const store = useStore();
const { t } = useI18n();
const resultImageList = ref([]);
const hasAlbumWritePermission = ref(true);
const orderID = ref(null);
const showShare = ref(false);
const fakeImg = ref("");
const share = ref(false); //分享模式，不能关闭分享的弹窗

onLoad(async (param) => {
  if (param.orderId) {
    orderID.value = param.orderId;
  }
  console.log(param);
  if (param.share) {
    share.value = true;
    showShare.value = true;
    fakeImg.value = decodeURIComponent(param.share);
  } else {
    let tmp = AblumStore.getImageList(store) || [];
    resultImageList.value = tmp;
    fakeImg.value =
      tmp[0]?.result_image ||
      "https://mydolldoll-test.oss-cn-shanghai.aliyuncs.com/7453ac0a-6bbc-46ae-8723-d2ba74a9128b";
  }
});

onShareAppMessage((res) => {
  console.log(res);
  if (res.target.id === "friend") {
    return {
      title: "快来一起玩吧",
    };
  }
  const img = fakeImg.value;
  return {
    title: t("api-share.moment-title.default"),
    path: "/pages/index/index",
    imageUrl: img,
  };
});
onShareTimeline(() => {
  const img = fakeImg.value;
  return {
    title: t("api-share.moment-title.default"),
    query: "share=" + encodeURIComponent(img),
  };
});
const onBack = () => {
  //uni.navigateBack();
  goHome();
};
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
const openShare = () => {
  if (share.value) {
    console.log("关不掉");
    return;
  }
  showShare.value = !showShare.value;
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
const onShareFriend = () => {
  /*uni.share({
    provider: "weixin",
    scene: "WXSceneSession",
    type: 2,
    imageUrl: "https://qiniu-web-assets.dcloud.net.cn/unidoc/zh/uni@2x.png",
    success: function (res) {
      console.log("success:" + JSON.stringify(res));
    },
    fail: function (err) {
      console.log("fail:" + JSON.stringify(err));
    },
  }); app才能用，小程序不支持*/
};
</script>

<style lang="scss" scoped>
.bg-white {
  background: white;
}
.content {
  text-align: center;
  height: calc(100vh - 60px);
  margin-top: 60px;
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
.overflowBody {
  height: 100%;
  overflow: auto;
}
.closeIconArea {
  height: 50px;
  padding: 20px;
  display: flex;
  //justify-content: flex-end;
  align-items: flex-end;
}
.w564 {
  width: 580rpx;
  margin: 0 auto;
}
.icon-3 {
  width: 200rpx;
  height: 200rpx;
  margin: 0;
}
.f-text {
  font-size: 28rpx;
  color: #ffffff;
  margin-top: -30rpx;
}
.shareImg {
  position: relative;
  width: 640rpx;
  margin: 0 auto;
  .img1 {
    width: 640rpx;
    height: 1072rpx;
    border-radius: 32rpx;
  }
  .img2 {
    position: absolute;
    left: 24rpx;
    bottom: 24rpx;
    width: 592rpx;
    height: 196rpx;
  }
  .img3 {
    position: absolute;
    bottom: 48rpx;
    right: 48rpx;
    width: 148rpx;
    height: 148rpx;
  }
}
</style>
