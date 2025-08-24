<template>
  <view class="content">
    <view
      class="choosedImgWrap"
      :style="{
        width: `${renderWidth}rpx`,
        height: `${renderHeight}rpx`,
        margin: '32rpx',
      }">
      <swiper
        class="swiper"
        indicator-dots
        :interval="3000"
        :duration="600"
        :current="selectIndex"
        indicator-active-color="#C465FF"
        indicator-color="rgba(217,217,217,0.300)">
        <swiper-item
          v-for="(template, index) in groupList"
          :key="index"
          class="swiperItem">
          <image
            :src="template.cover"
            mode="widthFix"
            :style="{
              width: `${renderWidth}rpx`,
              height: 'auto',
              borderRadius: '8px',
            }" />
        </swiper-item>
      </swiper>
    </view>
    <view class="image-group-wrapper">
      <text class="group-title">— 请选择喜欢的手办风格 —</text>
      <swiper
        class="swiperWrap"
        :current="curPage"
        height="100%"
        :autoplay="false"
        next-margin="0"
        @change="handleSwiperChange">
        <swiper-item
          v-for="(groupF, indexF) in Math.ceil(groupList.length / 4)"
          :key="indexF">
          <view class="image-list-wrapper">
            <view
              v-for="(group, index) in groupList.slice(
                indexF * 4,
                4 + indexF * 4
              )"
              :key="group.uuid">
              <view
                class="top-wrapper"
                @tap="handleMoreClick(group, index, indexF)">
                <view class="image-wrapper">
                  <image
                    :src="group.cover"
                    mode="aspectFill"
                    :class="
                      groupList[selectIndex].uuid === group.uuid
                        ? 'selected'
                        : ''
                    "
                    :lazy-load="true"></image>
                </view>
                <text>
                  {{
                    group.title.length > 8
                      ? group.title.slice(0, 16) + "..."
                      : group.title
                  }}
                </text>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>
    <view class="">
      <image src="/static/errorDemo.png" class="error-title"></image>
    </view>
    <view class="err-body">
      <view class="" v-for="(item, index) in '1234'" :key="index">
        <view class="err-img"></view>
        <text class="err-txt">错误示例{{ index + 1 }}</text>
      </view>
    </view>
    <view class="name-btn-big marginTop20" @tap="$debounceClick(chooseImage)()">
      <view>导入照片并开始设计</view>
      <view class="pkg-info" v-if="hadAsk">
        剩余免费次数：
        <text class="pkg-cnt">{{ balance_draw || "0" }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { useStore } from "vuex";
import { ref, computed } from "vue";
import { goToLogin, checkLogin } from "../../utils/common";
import { baseUrl, requireLogin } from "../../utils/request";
import { DraftStore, DraftType } from "../../store/draft";
import { onLoad, onShow, onShareAppMessage } from "@dcloudio/uni-app";
import { getUserInfo, getVipCount } from "../../api/user";
import { createSwap } from "../../api/faceSwap";
const renderWidth = 686;
const renderHeight = 714; //renderWidth * 1;

const hadAsk = ref(false);
const store = useStore();
const selectIndex = ref(0);
const curPage = ref(0);
// store.dispatch("fetchSwap");
const balance_draw = computed(() => store.state.balance_draw);
const groupList = computed(() => {
  // return store.state.swap;
  return store.state.tempTitleList[0]?.list || [];
});

const getUserBalance = () => {
  getVipCount().then((res) => {
    hadAsk.value = true;
    store.commit("setBalance_draw", res.Data?.number || 0);
  });
};

const handleMoreClick = (group, index, indexF) => {
  DraftStore.resetTemplate(store);
  selectIndex.value = index + indexF * 4;

  store.commit("setBrowseringGroupDetail", {
    groupId: group.id,
    groupName: group.name,
    templateList: group.templates,
  });
  // uni.navigateTo({
  //   url: `/pages/swap/template`,
  // });
};

onShareAppMessage(() => {
  return {
    title: "My写真",
    path: "/pages/swap/index",
  };
});
const handleSwiperChange = (current) => {
  const nextPage = current.detail.current;
  curPage.value = nextPage;
};
onLoad(() => {
  getUserBalance();
});
onShow(() => {
  getUserBalance();
});
//来自draw/confirm.vue中同上传方法
const selectedAvatar = ref(null);
const chooseImage = async (sourceType = "album") => {
  const isLogin = await checkLogin({ delta: 1 });

  if (!isLogin) {
    uni.showToast({
      title: "请登录",
      icon: "none",
    });
    goToLogin();
    return;
  }

  uni.chooseImage({
    count: 1,
    sizeType: ["original", "compressed"],
    sourceType: [sourceType],
    success: (res) => {
      console.log(JSON.stringify(res.tempFilePaths));
      confirmUpload(res.tempFilePaths[0]);
    },
    fail: () => {},
  });
};

const confirmUpload = async (filePath) => {
  console.log("filePath = ", filePath);
  if (!filePath) {
    return;
  }

  uni.showLoading({ title: "制作中", mask: true });
  try {
    /*const res = await createAvatar(filePath);
    uni.hideLoading();
    const data = res.data; //JSON.parse(res.data);
    if (data.code === -1) {
      requireLogin({
        toastMsg: t("api-toast.login-status-expired"),
      });
    }
    if (data.code !== 20000) {
      uni.showToast({
        title: data.msg || t("api-toast.server-error"),
        icon: "none",
      });
      return;
    }
    //getAvatarList();
    selectedAvatar.value = res.data.url;*/
    const token = uni.getStorageSync("token");

    // 如果存在 token，则将其添加到请求头中
    let header;
    if (token) {
      header = { Authorization: token };
    } else {
      requireLogin();
      return Promise.reject(new Error("No token found"));
    }

    uni.uploadFile({
      //url: `${baseUrl}/api/face_swap/create_avatar`,
      url: `${baseUrl}/system/upload`,
      filePath: filePath,
      name: "file",
      header: header,
      success: (res) => {
        uni.hideLoading();
        const data = JSON.parse(res.data);
        if (data.code === -1) {
          requireLogin({
            toastMsg: t("api-toast.login-status-expired"),
          });
        }
        if (data.code !== 20000) {
          uni.showToast({
            title: data.msg || t("api-toast.server-error"),
            icon: "none",
          });
          return;
        }
        //getAvatarList();
        selectedAvatar.value = data.data.url;
        designImage(data.data.url);
      },
      fail: () => {},
    });
  } catch (err) {
    console.log(err);
    uni.hideLoading();
  }
};
const designImage = async (imageUrl) => {
  // if (!selectedAvatar.value) {
  //   uni.showToast({
  //     title: "请先选择一个数字分身",
  //     icon: "none",
  //   });
  //   return;
  // }
  let temp_uuid = groupList.value[selectIndex.value].uuid;
  store.commit("setTempUuid", temp_uuid);
  const res = await createSwap({
    template_uuid: temp_uuid,
    // avatar_id: selectedAvatar.value.id,
    origin_image: imageUrl || groupList.value[selectIndex.value].cover,
  });

  if (res.code !== 20000) {
    uni.showToast({
      title: res.msg || "服务器开小差了",
      icon: "none",
    });

    return;
  }
  DraftStore.setTemplate(
    store,
    new DraftType.Template({
      id: temp_uuid,
      name: groupList.value[selectIndex.value].title,
      target_image: groupList.value[selectIndex.value].cover,
    })
  );
  getUserBalance();
  // AblumStore.setImageList(store, [
  //   new AblumType.ImageItem({
  //     result_image: res.data.result.result_image,
  //     template_name: userDraft.value.template.name,
  //   }),
  // ]);
  uni.navigateTo({
    url: "/pages/draw/result?uuid=" + res.uuid,
  });
};
</script>

<style lang="scss" scoped>
@import "@/common/main.scss";
@import "@/common/variable.scss";

.content {
  display: flex;
  height: 100vh;
  background-size: 100%;
  flex-flow: column;
  overflow: auto;
  box-sizing: border-box;
}
.error-title {
  width: 140rpx;
  height: 42rpx;
  margin-left: 32rpx;
}

.header-wrapper {
  height: 92rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 8px 32rpx 18px;

  image {
    width: 48rpx;
    height: 48rpx;
    border-radius: 4px;
  }

  .logo-icon {
    width: 80px;
    height: 20px;
  }

  .left-panel-wrapper {
    display: flex;
    align-items: center;
  }

  .right-panel-wrapper {
    display: flex;
    align-items: center;
  }
}

.search-wrapper {
  padding: 16px 32rpx 0px;
  color: #fff;

  .input-box {
    background-color: #382f48;
    text-align: start;
    // line-height: 48px; 会出现挡住所文字的情况
    padding: 0 28rpx;
    font-size: 14px;
    border-radius: 8px;
    border: none;
    margin-bottom: 24rpx;
    box-sizing: border-box;
    height: 30px;
  }
}

.image-group-wrapper {
  //overflow: auto;
  //padding-bottom: 100px;
  .group-title {
    margin-top: 28rpx;
    font-size: 24rpx;
    display: block;
    text-align: center;
    color: #000;
  }
}

.image-list-wrapper {
  display: flex;
  margin-top: 8px;
  gap: 14px;
  align-items: center;
  justify-content: center;

  .top-wrapper {
    text-align: center;
    margin-bottom: 12px;

    text {
      color: #101010;
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      line-height: 16px; /* 100% */
      letter-spacing: 1px;
    }

    image {
      height: 144rpx;
      width: 144rpx;
      border-radius: 8px;
      overflow: hidden;
      background: $image-skeleton-background-pink-font-size-14;
    }
    .selected {
      border: 2rpx solid #8537ee;
    }
  }

  .popular-image-list-wrapper {
    margin-top: 10px;

    .popular-bottom-wrapper {
      padding: 0 0 8px;
      display: flex;
      gap: 24rpx;
      overflow: auto;

      image {
        height: calc(100vw - 64rpx);
        width: calc(100vw - 64rpx);
        margin: 0 32rpx;
        border-radius: 8px;
        background: $image-skeleton-background-pink-font-size-14;
      }
    }
  }
}
.choosedImgWrap {
  margin: 32rpt auto;
}
.swiper {
  width: 100%;
  height: calc(100vw - 64rpx);

  .swiper-item-wrapper {
    position: relative;

    .title {
      position: absolute;
      right: 72rpx;
      bottom: 46px;
      color: #fff;
      font-size: 33px;
      font-weight: 600;
    }

    .desc {
      position: absolute;
      right: 72rpx;
      bottom: 32px;
      color: rgba(255, 255, 255, 0.79);
      font-size: 12px;
      font-weight: 500;
    }

    .tips {
      position: absolute;
      left: 56rpx;
      top: 14px;
      color: rgba(255, 255, 255, 0.66);
      font-size: 12px;
      font-weight: 500;
    }

    .tips-banner {
      position: absolute;
      right: 56rpx;
      top: 0px;
      line-height: 60rpx;
      color: rgba(255, 255, 255, 0.66);
      font-size: 12px;
      font-weight: 500;
    }

    image {
      position: relative;
    }

    .banner {
      position: absolute;
      top: 0;
      left: 0;
      color: #fff;
      font-size: 14px;
      font-weight: 500;
      width: 182rpx;
      height: 54rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #ff3f6d;
      border-radius: 0 0 16px 0;
    }
  }
}
</style>
