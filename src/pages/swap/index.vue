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
        indicator-active-color="#C465FF"
        indicator-color="rgba(217,217,217,0.300)">
        <swiper-item
          v-for="(template, index) in groupList.slice(0, 4)"
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
      <view class="image-list-wrapper">
        <view v-for="(group, index) in groupList.slice(0, 4)" :key="group.uuid">
          <view class="top-wrapper" @tap="handleMoreClick(group, index)">
            <view class="image-wrapper">
              <image
                :src="group.cover"
                mode="aspectFill"
                :class="selectIndex === index ? 'selected' : ''"
                @tap="handleMoreClick(group, index)"
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
    <view class="name-btn-big marginTop30" @tap="$debounceClick(designImage)()">
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
import { DraftStore, DraftType } from "../../store/draft";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import { getUserInfo, getVipCount } from "../../api/user";
import { createSwap } from "../../api/faceSwap";
const renderWidth = 686;
const renderHeight = 714; //renderWidth * 1;

const hadAsk = ref(false);
const store = useStore();
const selectIndex = ref(0);
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

const handleMoreClick = (group, index) => {
  DraftStore.resetTemplate(store);
  selectIndex.value = index;

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
    title: "Luna AI写真",
    path: "/pages/swap/index",
  };
});
onLoad(() => {
  getUserBalance();
});

const designImage = async () => {
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
    origin_image: groupList.value[selectIndex.value].cover,
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
  margin-bottom: 14px;
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
