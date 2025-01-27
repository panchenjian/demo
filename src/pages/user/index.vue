<template>
  <view class="content">
    <view class="menu-area">
      <view class="user-info">
        <view class="nickname-wrap">
          <image
            class="avatar-img"
            src="/static/default-avatar-icon.png"
            mode="aspectFill"
          ></image>
          <view class="nickname">{{ userInfo?.nickname || "请先登录" }}</view>
        </view>
        <view class="info">
          <view class="pkg-info" v-if="userInfo?.balance_draw">
            余额张数：
            <text>{{ userInfo?.balance_draw || "" }}</text>
          </view>
        </view>
      </view>
      <view class="menu-wrapper">
        <button
          type="plain"
          class="menu-btn"
          @tap="$debounceClick(openQrPopup)()"
        >
          {{ "限时福利" }}
        </button>
        <button
          v-if="osName == 'android'"
          type="plain"
          class="menu-btn"
          @tap="$debounceClick(onRechargeBtnClick)()"
        >
          充值兑换
        </button>
        <button
          v-else
          type="plain"
          class="menu-btn"
          @tap="$debounceClick(onClickCardCode)()"
        >
          兑换码
        </button>
        <button type="plain" class="menu-btn" open-type="contact">
          {{ "在线客服" }}
        </button>
      </view>
    </view>
    <view class="order-area">
      <view
        class="default-wrap"
        v-if="isLoaded && (!orderList || orderList.length == 0)"
      >
        <image
          class="default-img"
          src="../../static/order-default-bg.png"
        ></image>
        <text>{{ t("user-index.default-label") }}</text>
      </view>
      <scroll-view
        class="scrollView"
        scroll-y="true"
        enhanced="{{true}}"
        show-scrollbar="{{false}}"
        refresher-enabled="{true}"
        :refresher-threshold="100"
        :refresher-triggered="isRefresherTriggered"
        @refresherrefresh="onRefresh"
        @refresherrestore="onRestore"
        @scrolltolower="loadMore"
      >
        <view class="list">
          <view class="left-image-list-wrapper image-list-wrapper">
            <view
              class="image-wrapper"
              v-for="(item, index) in leftList"
              :key="item.id || index"
              @tap="$debounceClick(goToDetail)(item)"
              :animation="item.animationData"
            >
              <image
                :src="item.result_image"
                mode="widthFix"
                class="result-image"
                :lazy-load="true"
              ></image>
              <view class="result-desc">
                <view class="result-date">{{
                  formatDate(item.create_time)
                }}</view>
                <image
                  src="/static/delete-avatar-icon.svg"
                  class="delete-icon"
                  @tap.stop="$debounceClick(onRemoveRecord)(item)"
                />
              </view>
            </view>
          </view>
          <view class="image-list-wrapper">
            <view
              class="image-wrapper"
              v-for="(item, index) in rightList"
              :key="item.id || index"
              @tap="$debounceClick(goToDetail)(item)"
              :animation="item.animationData"
            >
              <image
                :src="item.result_image"
                mode="widthFix"
                class="result-image"
                :lazy-load="true"
              ></image>
              <view class="result-desc">
                <view class="result-date">{{
                  formatDate(item.create_time)
                }}</view>
                <image
                  src="/static/delete-avatar-icon.svg"
                  class="delete-icon"
                  @tap.stop="$debounceClick(onRemoveRecord)(item)"
                />
              </view>
            </view>
          </view>
        </view>
        <view
          v-if="isTotallyLoaded && orderList.length >= 8"
          class="listTips"
          >{{ t("user-index.to-bottom-tip") }}</view
        >
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import { removeRecord, userRecords } from "../../api/faceSwap.js";
import { defaultLoadingTitle } from "../../common/variable.js";
import { AblumStore, AblumType } from "../../store/album";
import { onLoad, onShow, onUnload } from "@dcloudio/uni-app";

const store = useStore();
const { t } = useI18n();

const orderList = ref([]);

const leftList = computed(() => {
  if (!orderList.value) return [];
  return orderList.value.filter((_, index) => index % 2 === 0);
});

const rightList = computed(() => {
  if (!orderList.value) return [];
  return orderList.value.filter((_, index) => index % 2 !== 0);
});

store.dispatch("fetchUserInfo");
const userInfo = computed(() => store.state.userInfo);

const onRemoveRecord = (item) => {
  uni.showModal({
    content: "是否删除该记录？",
    confirmText: "确认删除",
    confirmColor: "#FF0000",
    success: function (res) {
      if (res.confirm) {
        // 过渡动画
        const animation = uni.createAnimation({
          duration: 300,
          timingFunction: "ease",
        });
        animation.opacity(0).scale(0.8).step();
        item.animationData = animation.export();
        setTimeout(() => {
          // 删除记录
          removeRecord(item.id).then((res) => {
            if (res.code != 1) {
              uni.showToast({
                title: res.msg || t("api-toast.server-error"),
                icon: "none",
              });
              return;
            }
            orderList.value = orderList.value.filter((i) => i.id !== item.id);
          });
        }, 300);
      } else if (res.cancel) {
        console.log("用户点击取消");
      }
    },
  });
};

const formatDate = (date) => {
  const dateRaw = date.split(" ")[0];
  const [year, month, day] = dateRaw.split("-");
  return `${year}年${month}月${day}日`;
};

const perPage = ref(10);
const total = ref(10);
const curPage = ref(0);
const isTotallyLoaded = ref(false);
const fromPage = ref("");
const isLoaded = ref(false);
const isRefresherTriggered = ref(false);
const isRefreshing = ref(false);

onLoad((option) => {
  fromPage.value = option.from;
  fetchGalleryList();
});

onShow(() => {
  console.log("onShow");
  if (!orderList.value.length) {
    initList();
    fetchGalleryList(true, true);
  }
});

onUnload(() => {
  // 当从生成页跳转过来时强制返回订单页
  if (fromPage.value === "generate") {
    uni.reLaunch({
      url: "/pages/user/index",
    });
  }
});

// 方法
const initList = () => {
  curPage.value = 0;
  isTotallyLoaded.value = false;
  total.value = 10;
  perPage.value = 10;
};

const onRefresh = () => {
  isRefresherTriggered.value = true;
  if (isRefreshing.value) return;
  isRefreshing.value = true;

  initList();
  fetchGalleryList(false, true).finally(() => {
    isRefresherTriggered.value = false;
    isRefreshing.value = false;
  });
};

const onRestore = () => {
  isRefresherTriggered.value = "restore";
};

const fetchGalleryList = (showLoading = true, reset) => {
  if (showLoading) {
    uni.showLoading({ title: defaultLoadingTitle });
  }
  return userRecords(
    {
      page: curPage.value + 1,
      per_page: perPage.value,
    },
    !showLoading
  )
    .then((res) => {
      uni.hideLoading();
      isLoaded.value = true;
      if (res.code != 1) {
        uni.showToast({
          title: res.msg || t("api-toast.server-error"),
          icon: "none",
        });
        return;
      }
      console.log("res = ", res);
      const data = res.data.lists;
      if (data.length < perPage.value) {
        console.log("end");
        isTotallyLoaded.value = true;
      }
      if (reset) {
        orderList.value = data;
        curPage.value = 1;
      } else {
        orderList.value = orderList.value.concat(data);
        curPage.value = curPage.value + 1;
      }
    })
    .catch((err) => {
      console.log("err = ", err);
      uni.hideLoading();
      isLoaded.value = true;
    });
};

const loadMore = () => {
  if (isTotallyLoaded.value) return;
  fetchGalleryList();
};

const goToDetail = (item) => {
  AblumStore.setImageList(store, [
    new AblumType.ImageItem({
      result_image: item.result_image,
      template_name: item.template_name,
    }),
  ]);
  uni.navigateTo({
    url: "/pages/draw/result",
  });
};
</script>

<style lang="scss" scoped>
@import "@/common/variable.scss";

.content {
  height: 100%;
}

.default-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  padding: 390rpx 0 0;
  box-sizing: border-box;

  .default-img {
    width: 392rpx;
    height: 336rpx;
  }

  text {
    font-size: 14px;
    color: #d1d1d1;
    line-height: 36rpx;
  }
}

.scrollView {
  height: 100vh;
  background-size: 100%;
  flex-flow: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 12px 0;
  display: flex;
}

.item:first-child {
  padding-top: 40rpx;
}

.item:last-child {
  padding-bottom: 48rpx;
}

.orderWrap {
  display: flex;
  height: 232rpx;
  // width: 100%;
  box-sizing: border-box;
  padding: 40rpx 24rpx;
  background: #f6f0ff;
  border-radius: 8px;
  margin-bottom: 40rpx;
  align-items: center;
  position: relative;

  .orderBtn {
    position: absolute;
    top: 148rpx;
    left: 494rpx;
    min-width: 152rpx;
    white-space: nowrap;
    background: #b15cff;
    border-radius: 23px;
    color: #fff;
    text-align: center;
    font-size: 12px;
    font-weight: 500;
    line-height: 56rpx;
    border: none;
  }

  @media (max-width: 330px) {
    .orderBtn {
      min-width: 78px;
      left: 474rpx;
    }
  }

  .orderBtn::after {
    border: none;
  }

  .btnGenerating {
    background: #fff;
    color: #e2bdff;
  }

  .btnError {
    background: #fff;
    color: #b15cff;
  }

  .reUpload {
    background: #fff;
    color: #b15cff;
  }
}

.errorOrderTip {
  position: absolute;
  display: inline-block;
  font-weight: 500;
  line-height: 18px;
  font-size: 12px;
  color: #ffb5cf;
  right: 30rpx;
  top: 40rpx;
}

.picPreviewWrap {
  display: flex;
  width: 176rpx;
  flex-wrap: wrap;
  gap: 8rpx;
  // align-items: center;
  margin-right: 20rpx;
  height: 100%;

  .picWrap {
    width: 84rpx;
    height: 84rpx;
  }

  .pic {
    width: 84rpx;
    height: 84rpx;
    border-radius: 4px;
    background: linear-gradient(141deg, #d4b2ff 0%, #f1c9ff 100%);
  }
}

.singlePicPreviewWrap {
  width: 176rpx;
  // align-items: center;
  margin-right: 20rpx;
  height: 100%;

  .picWrap {
    width: 100%;
    height: 100%;
  }

  .pic {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    background: linear-gradient(141deg, #d4b2ff 0%, #f1c9ff 100%);
  }
}

.orderInfoWrap {
  height: 100%;

  .orderDate {
    color: #000;
    font-size: 12px;
    line-height: 36rpx;
    margin-bottom: 10rpx;
  }

  .orderTitle {
    color: #000;
    font-size: 16px;
    line-height: 36rpx;
    margin-bottom: 50rpx;
  }

  .orderAmount {
    color: rgba(0, 0, 0, 0.19);
    font-family: DIN Condensed;
    font-size: 16px;
    font-weight: 700;
    line-height: 36rpx;
  }
}

.listTips {
  text-align: center;
  line-height: 40rpx;
  color: #c8c8c8;
  font-size: 14px;
  margin-top: 48rpx;
  padding-bottom: 66rpx;
}

.list {
  display: flex;
  justify-content: space-between;
  overflow: auto;

  .image-list-wrapper {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-right: 32rpx;
  }

  .image-wrapper {
    position: relative;
    margin-bottom: 2px;

    .result-image {
      width: 324rpx;
      border-radius: 8px;
      background: $image-skeleton-background-pink-font-size-14;
    }

    text {
      position: absolute;
      text-align: start;
      left: 8px;
      bottom: 8px;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      line-height: 16px; /* 100% */
      letter-spacing: 1px;
      z-index: 3;
    }

    .result-desc {
      height: 36rpx;
      z-index: 2;
      border-radius: 0 0 8px 8px;
      font-size: 12px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      color: #000;
      background-color: #f4f4f4;
      gap: 2px;
      padding: 8px;

      .result-date {
        font-size: 12px;
        font-weight: 300;
      }

      .delete-icon {
        width: 14px;
        height: 14px;
        background: rgba(239, 83, 80, 0.78);
        border-radius: 50%;
        padding: 2px;
        z-index: 999;
      }
    }
  }

  .image-wrapper::before {
    position: absolute;
    bottom: 0;
    height: 62px;
    border-radius: 8px;
    content: "";
    left: 0;
    right: 0;
    z-index: 2;
  }

  .left-image-list-wrapper {
    padding-left: 32rpx;
    padding-right: 0;
    .image-wrapper:nth-child(odd) {
      .result-image {
        width: 330rpx;
      }
    }

    .image-wrapper:nth-child(even) {
      .result-image {
        width: 324rpx;
        height: 206px;
      }
    }
  }
}

.menu-area {
  background: linear-gradient(105.34deg, #c465ff 9.23%, #8247ff 105.76%);

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 8rpx 32rpx 16px 32rpx;

  .left-wrapper {
  }

  .user-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .nickname-wrap {
      display: flex;
      justify-content: left;
      align-items: center;

      .nickname {
        color: #fff;
        text-align: left;
        font-family: PingFang SC;
        font-size: 17px;
        font-style: normal;
        font-weight: 600;
        line-height: 20px; /* 125% */
        letter-spacing: -0.5px;
        margin-left: 20rpx;
      }
    }

    .avatar-img {
      width: 88rpx;
      height: 88rpx;
      border-radius: 50%;
      margin-right: 16rpx;
    }

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
  }

  .menu-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 30rpx;

    .menu-btn {
      margin: 0;
      width: 208rpx;
      height: 66rpx;
      flex-shrink: 0;
      border-radius: 16rpx;
      background: $main-button-color;

      color: #fff;
      text-align: center;
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
      line-height: 18px; /* 120% */
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .menu-wrapper-double-btn {
    justify-content: space-between;
    .menu-btn {
      width: 48%;
      margin: 0;
    }
  }
}
</style>
