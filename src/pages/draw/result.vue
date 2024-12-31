<template>
  <view :class="getTheme()" class="content">
    <view class="pageNumTips" :style="$getMediumFontWeight()">
      <text class="currTemplateName">{{ currentTemplateName }}</text>
    </view>
    <swiper
      class="swiperWrap"
      :current="currentPage"
      :autoplay="false"
      @change="handleSwiperChange"
    >
      <swiper-item
        v-for="(item, index) in resultImageList"
        :key="index"
        class="swiper-item"
      >
        <view class="result-image-wrap">
          <image
            :src="item.result_image"
            mode="widthFix"
            class="result-image"
            @tap="$debounceClick(handleClickImage)(item)"
          ></image>
        </view>
      </swiper-item>
    </swiper>
    <view class="footerTips">
      <text>{{ t("draw-detail.tip") }}</text>
    </view>
    <view class="toolBar">
      <view class="toolBarItemWrap">
        <button class="btnWrap" open-type="share">
          <image :src="blackShareIcon"></image>
          <text class="" :style="$getMediumFontWeight()">{{
            t("draw-detail.share-btn")
          }}</text>
        </button>
      </view>
      <view
        class="toolBarItemWrap"
        @tap="
          $debounceClick(onSaveImage)([
            resultImageList[currentPage].result_image,
          ])
        "
      >
        <image :src="blackDownloadIcon"></image>
        <text class="" :style="$getMediumFontWeight()">{{
          t("draw-detail.download-btn")
        }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { requestAuthThenSaveImages } from "../../utils/common";
import { blackDownloadIcon, blackShareIcon } from "../../common/svgBase64";
import { defaultLoadingTitle } from "../../common/variable.js";
import { osName } from "../../context.js";
import { AblumStore } from "../../store/album";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";

const store = useStore();
const { t } = useI18n();

// 定义响应式数据
const resultImageList = ref([]);

const currentPage = ref(0);
const currentTemplateName = computed(() => {
  return resultImageList.value[currentPage.value]?.template_name;
});

const photoAlbumType = ref("");
const hasAlbumWritePermission = ref(true);

// 页面生命周期钩子
onLoad(() => {
  photoAlbumType.value = "";
  resultImageList.value = AblumStore.getImageList(store);
  currentPage.value = AblumStore.getPreviewImageIndex(store) || 0;
});

onShareAppMessage(() => {
  const img = resultImageList.value[currentPage.value];
  return {
    title: t("api-share.moment-title.default"),
    path: "/pages/index/index",
    imageUrl: img.result_image,
  };
});

const handleClickImage = (img) => {
  if (osName.value === "android") {
    previewImageonAndriod(img.result_image);
  } else {
    uni.previewImage({
      current: currentPage.value,
      urls: resultImageList.value.map((img) => img.result_image),
    });
  }
};

const getTheme = () => {
  return photoAlbumType.value === "gallary" ? "gallaryTheme" : "portraitTheme";
};

const handleSwiperChange = (current) => {
  currentPage.value = current.detail.current;
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
@import "@/common/variable.scss";
.content {
  height: 100%;
  text-align: center;
  padding: 40rpx 0;
  box-sizing: border-box;
  min-height: 600px;
}

.gallaryTheme {
  background-color: #111;
  padding: 192rpx 0 0;

  .pageNumTips {
    background: transparent;
    color: #484848;
    font-size: 14px;
  }

  .swiperWrap {
    height: 478rpx;
    margin-bottom: 24rpx;
  }

  .result-image {
    margin: 0;
    border-radius: 0;
    height: 480rpx;
    width: 100%;
    background: $image-skeleton-background-black-font-size-14;
  }

  .footerTips {
    color: #484848;
    margin-bottom: 120rpx;
  }

  .btnWrap,
  .toolBarItemWrap {
    background-color: transparent;
  }

  .toolBar text {
    color: #aaa;
  }
}

.swiperWrap {
  height: 912rpx;
  margin-bottom: 28rpx;
}

.pageNumTips {
  display: inline-block;
  line-height: 54rpx;
  color: #fff;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 40rpx;
  min-width: 228rpx;
  padding: 0 39rpx;
  border-radius: 78rpx;
  background: #dfdfdf;
}

.currTemplateName {
  margin-right: 16rpx;
}

.result-image-wrap {
  overflow: hidden;
  width: 100%;
  display: flex;
  justify-content: center;
  box-sizing: border-box;
}

.swiper-item {
  border-radius: 20rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.result-image {
  margin: 0 56rpx 0;
  width: 620rpx;
  box-sizing: border-box;
  border-radius: 8px;
  display: block;
  background: $image-skeleton-background-pink-font-size-20;
}

.toolBar {
  display: flex;
  justify-content: center;
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

.btnWrap {
  display: flex;
  flex-direction: column;
  background-color: white;
  padding: 0;
}

.toolBarItemWrap:first-child {
  margin-right: 183rpx;
}

.btnWrap::after {
  border: none;
}

.footerTips {
  line-height: 17px;
  color: #dcdcdc;
  text-align: center;
  font-size: 12px;
  margin-bottom: 68rpx;
}
</style>
