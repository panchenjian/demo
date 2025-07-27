<template>
  <view class="content">
    <CardCodeInput ref="cardCodeInputPopupRef" />
    <ShowQrCode ref="showQrCodePopupRef" />
    <view class="menu-area">
      <view class="user-info">
        <view class="nickname-wrap">
          <image
            class="avatar-img"
            :src="userInfo?.avatar || '/static/user.png'"
            mode="aspectFill"></image>
          <view class="info">
            <view class="nickname">{{ userInfo?.nickname || "请先登录" }}</view>
            <view class="pkg-info" v-if="userInfo?.nickname">
              剩余可用次数：
              <text class="pkg-cnt">{{ balance_draw || "" }}次</text>
            </view>
          </view>
        </view>
      </view>
      <view class="menu-wrapper">
        <view class="menu-btn" @tap="$debounceClick(jumpVip)()">
          <view class="center-flex">
            <image src="/static/vip.png" class="btn-icon"></image>
            会员
          </view>
          <view class="menu-des">当前尚未开通会员</view>
        </view>
        <view class="menu-btn" @tap="$debounceClick(jumpOrder)()">
          <view class="center-flex">
            <image src="/static/list.png" class="btn-icon"></image>
            订单
          </view>
          <view class="menu-des">点击查看我的订单</view>
        </view>
        <!-- <button
          type="plain"
          class="menu-btn"
          @tap="$debounceClick(openQrPopup)()"
        >
          {{ "限时福利" }}
        </button>
        <button
          v-if="!isIOS()"
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
        </button> -->
      </view>
    </view>
    <view class="group-list">
      <!-- <v-tabs
        v-model="current"
        :tabs="tabs"
        @change="changeTab"
        lineColor="#B37DF5"
        activeColor="#B37DF5"
        lineHeight="2px"
        lineScale="0.7"></v-tabs> -->
      <view class="group-wrap">
        <view
          v-for="(group, index) in tabs"
          :key="index"
          :class="'tag-item ' + (current == index ? 'tag-selected' : '')"
          @tap="changeTab(index)">
          <view :class="current == index ? 'tabbg-w' : 'hidden'">
            <image :src="tabBg" class="tabbg"></image>
          </view>
          <view class="tab-title">{{ group }}</view>
        </view>
      </view>
    </view>

    <view class="order-area">
      <view
        class="default-wrap"
        v-if="isLoaded && (!orderList || orderList.length == 0)">
        <view v-if="userInfo?.nickname">
          <image
            class="default-img"
            src="../../static/order-default-bg.png"></image>
          <text class="text-tip-center">
            {{ t("user-index.default-label") }}
          </text>
        </view>
        <view class="text-tip-center" v-else>
          <image class="default-img2" src="../../static/empty.png"></image>
          <text class="text-tip-center0">账号未登录</text>
          <text class="text-tip-center1">登录开始专属手办定制！</text>
          <text class="name-btn-mid0" @click="goToLogin">立即登录</text>
        </view>
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
        @scrolltolower="loadMore">
        <view class="list">
          <view class="left-image-list-wrapper image-list-wrapper">
            <view
              class="image-wrapper"
              v-for="(item, index) in leftList"
              :key="item.id || index"
              @tap="$debounceClick(goToDetail)(item)"
              :animation="item.animationData">
              <image
                :src="item.image_2d"
                mode="widthFix"
                class="result-image"
                :lazy-load="true"></image>
              <view class="result-desc">
                <view class="result-date">
                  {{ item.title }}
                </view>
                <view class="name-btn">
                  <text>GO</text>
                  <image
                    src="/static/goArrow.png"
                    class="arrow-icon-small"></image>
                </view>
                <!-- <image
                  src="/static/delete-avatar-icon.svg"
                  class="delete-icon"
                  @tap.stop="$debounceClick(onRemoveRecord)(item)" /> -->
              </view>
            </view>
          </view>
          <view class="image-list-wrapper">
            <view
              class="image-wrapper"
              v-for="(item, index) in rightList"
              :key="item.id || index"
              @tap="$debounceClick(goToDetail)(item)"
              :animation="item.animationData">
              <image
                :src="item.image_2d"
                mode="widthFix"
                class="result-image"
                :lazy-load="true"></image>
              <view class="result-desc">
                <view class="result-date">
                  {{ item.title }}
                </view>
                <view class="name-btn">
                  <text>GO</text>
                  <image
                    src="/static/goArrow.png"
                    class="arrow-icon-small"></image>
                </view>
                <!-- <image
                  src="/static/delete-avatar-icon.svg"
                  class="delete-icon"
                  @tap.stop="$debounceClick(onRemoveRecord)(item)" /> -->
              </view>
            </view>
          </view>
        </view>
        <view v-if="isTotallyLoaded && orderList.length >= 8" class="listTips">
          {{ t("user-index.to-bottom-tip") }}
        </view>
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
import ShowQrCode from "../../components/ShowQrCode.vue";
import CardCodeInput from "../../components/CardCodeInput.vue";
import { isIOS } from "../../main";
import { hotIcon, tabBg } from "../../common/svgBase64";
//import VTabs from "@/uni_modules/v-tabs/components/v-tabs/v-tabs";

const store = useStore();
const { t } = useI18n();

const current = ref(0);
const tabs = ref(["待定制", "已定制"]);
const changeTab = (index) => {
  current.value = index;
  initList();
  fetchGalleryList(true, true);
};

const balance_draw = computed(() => store.state.balance_draw);
const orderList = ref([]);

const leftList = computed(() => {
  if (!orderList.value) return [];
  return orderList.value.filter((_, index) => index % 2 === 0);
});

const rightList = computed(() => {
  if (!orderList.value) return [];
  return orderList.value.filter((_, index) => index % 2 !== 0);
});

//store.dispatch("fetchAppConfig");

store.dispatch("fetchUserInfo");
const userInfo = computed(() => store.state.userInfo);

const cardCodeInputPopupRef = ref(null);
const showQrCodePopupRef = ref(null);
const onClickCardCode = () => {
  cardCodeInputPopupRef.value.open();
};
const openQrPopup = () => {
  showQrCodePopupRef.value.open();
};
const onRechargeBtnClick = () => {
  uni.navigateTo({
    url: "/pages/recharge/index",
  });
};
const jumpOrder = () => {
  uni.navigateTo({
    url: "/pages/order/index",
  });
};
const jumpVip = () => {
  uni.navigateTo({
    url: "/pages/user/fellowVip",
  });
};

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
  if (userInfo.value?.nickname) fetchGalleryList();
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
      // per_page: perPage.value,
      size: 20,
      category: current.value ? "2" : "1",
    },
    !showLoading
  )
    .then((res) => {
      uni.hideLoading();
      isLoaded.value = true;
      if (res.code != 20000) {
        uni.showToast({
          title: res.msg || t("api-toast.server-error"),
          icon: "none",
        });
        return;
      }
      console.log("res = ", res);
      const data = res.data.items;
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
  store.commit("setTempUuid", item.template_uuid);
  AblumStore.setImageList(store, [
    new AblumType.ImageItem({
      result_image: item.image_2d,
      template_name: item.title,
    }),
  ]);
  uni.navigateTo({
    url: "/pages/draw/result?uuid=" + item.uuid,
  });
};
const goToLogin = () => {
  uni.navigateTo({
    url: "/pages/login/login",
  });
};
</script>

<style lang="scss" scoped>
@import "@/common/variable.scss";
@import "@/common/main.scss";

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
  .default-img2 {
    width: 164rpx;
    height: 164rpx;
  }

  .text-tip-center {
    color: #baaaf5;
    display: block;
    text-align: center;
    line-height: 36px;
  }
  .text-tip-center0 {
    font-size: 32rpx;
    color: #000000;
    line-height: 38rpx;
    text-align: center;
  }
  .text-tip-center1 {
    font-size: 28rpx;
    color: #8537ee;
    line-height: 38rpx;
    text-align: center;
  }
}

.scrollView {
  height: 90vh;
  background-size: 100%;
  flex-flow: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 12px 0;
  display: flex;
  background: linear-gradient(180deg, #ffffff 0%, #f6f6f6 100%);
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
    width: 332rpx;
    height: 470rpx;
    background: #ffffff;
    border-radius: 32rpx;
    .result-image {
      width: 316rpx;
      height: 374rpx;
      border-radius: 22rpx;
      background: $image-skeleton-background-pink-font-size-14;
    }

    // text {
    //   position: absolute;
    //   text-align: start;
    //   left: 8px;
    //   bottom: 8px;
    //   color: #fff;
    //   font-size: 16px;
    //   font-weight: 600;
    //   line-height: 16px; /* 100% */
    //   letter-spacing: 1px;
    //   z-index: 3;
    // }

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
      gap: 2px;
      padding: 8px;

      .result-date {
        font-size: 24rpx;
        color: #000000;
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
  background: url("data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20version%3D%221.1%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%221%22%20x1%3D%220%22%20x2%3D%221%22%20y1%3D%220%22%20y2%3D%220%22%20gradientTransform%3D%22matrix(6.123233995736766e-17%2C%201%2C%20-0.3508284023668639%2C%206.123233995736766e-17%2C%200.5%2C%200)%22%3E%3Cstop%20stop-color%3D%22%23d5c9fb%22%20stop-opacity%3D%221%22%20offset%3D%220%22%3E%3C%2Fstop%3E%3Cstop%20stop-color%3D%22%23ddd3fc%22%20stop-opacity%3D%220.91%22%20offset%3D%220.181%22%3E%3C%2Fstop%3E%3Cstop%20stop-color%3D%22%23ffffff%22%20stop-opacity%3D%220.77%22%20offset%3D%221%22%3E%3C%2Fstop%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%231)%22%3E%3C%2Frect%3E%3C%2Fsvg%3E");

  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 103px 32rpx 16px 32rpx;
  position: relative;
  &:after {
    content: "MYDollDoll";
    color: rgba(186, 170, 245, 0.19);
    font-size: 74px;
    font-weight: 700;
    line-height: 104px;
    position: absolute;
    top: 10px;
  }
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
        color: #000;
        text-align: left;
        font-family: HarmonyOS Sans SC, HarmonyOS Sans SC;
        font-weight: bold;
        font-size: 34rpx;
        line-height: 46rpx;
        max-width: 380rpx;
        display: inline-block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        height: 22px;
        margin-bottom: 8px;
      }
    }

    .avatar-img {
      width: 120rpx;
      height: 120rpx;
      border-radius: 50%;
      margin-right: 24rpx;
      border: 2rpx solid #ffffff;
    }

    .info {
      // display: flex;
      // justify-content: center;
      // align-items: flex-start;
      // flex-direction: column;
      // padding-top: 2px;
      // gap: 6px;

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
        font-weight: 400;
        font-size: 24rpx;
        color: rgba(0, 0, 0, 0.6);
        line-height: 32rpx;
        margin-left: 20rpx;
        .pkg-cnt {
          color: #ee00f3;
        }
      }
    }
  }

  .menu-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-top: 30rpx;
    gap: 16rpx;
    line-height: 23px;
    .btn-icon {
      width: 38rpx;
      height: 38rpx;
      margin-right: 8px;
    }
    .menu-btn {
      margin: 0;
      padding: 32rpx 48rpx;
      min-width: 208rpx;

      flex-shrink: 0;
      flex-grow: 1;
      background: #ffffff;
      box-shadow: 7rpx 14rpx 28rpx 7rpx #c8beeb;
      border-radius: 35rpx;

      color: #7c43cc;
      font-size: 14px;
      font-style: normal;
      font-weight: 600;
      line-height: 18px; /* 120% */
      // display: flex;
      // justify-content: center;
      // align-items: center;
    }
    .menu-des {
      font-size: 12px;
      margin-top: 16rpx;
      color: #ab9db5;
      font-size: 28rpx;
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
.group-list {
  border-radius: 36rpx 36rpx 0 0;
  padding: 32rpx;
  background-color: white;
  //border: 1px solid rgba(221, 211, 252, 0.91);
}
.name-btn-mid0 {
  width: 315rpx;
  height: 88rpx;
  background: linear-gradient(90deg, #b9aafc 0%, #8537ee 100%);
  border-radius: 1998rpx 1998rpx 1998rpx 1998rpx;
}
</style>
