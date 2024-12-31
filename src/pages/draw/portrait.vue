<template>
  <view class="content">
    <view class="group-list">
      <scroll-view
        class="scroll-view_H"
        scroll-x="true"
        :enhanced="true"
        :show-scrollbar="tagScrollVisbile"
        :scroll-into-view="'i' + curTagScrollView"
        scroll-with-animation="true"
      >
        <view class="group-wrap">
          <view
            v-for="(group, index) in groupList"
            :key="group.id"
            :style="$getMediumFontWeight()"
            :id="'i' + group.id"
            :class="
              'tag-item ' +
              (group.id == selectedGroup?.id ? 'tag-selected' : '')
            "
            @tap="onSelectGroup(group)"
          >
            {{ index == 0 ? `🔥 ` : "" }}{{ group.name }}
          </view>
        </view>
      </scroll-view>
    </view>
    <swiper
      class="swiperWrap"
      :current="curPage"
      height="100%"
      :autoplay="false"
      next-margin="0"
      @change="handleSwiperChange"
    >
      <swiper-item v-for="(group, index) in groupList" :key="index">
        <scroll-view
          class="scroll-view_Y"
          scroll-y="true"
          scroll-with-animation="false"
          :enhanced="true"
          :show-scrollbar="false"
        >
          <view
            class="template-wrap"
            :class="{ 'template-wrap-padding': actionBarVisible }"
          >
            <view
              v-for="(template, index) in group.templates"
              :key="index"
              class="template-item"
              @tap="$debounceClick(onSelectTemplate)(template)"
            >
              <view style="display: flex; flex-direction: column">
                <image
                  :src="template.target_image"
                  mode="aspectFill"
                  :lazy-load="true"
                  class="template-item-img"
                ></image>
                <view class="template-desc">
                  <view class="name">
                    {{ template.name }}
                  </view>
                </view>
              </view>
            </view>
          </view>
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { DraftStore, DraftType } from "../../store/draft";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import { useI18n } from "vue-i18n";

const selectedTemplate = ref(null);
const selectedGroup = ref();
const store = useStore();
const { t } = useI18n();

const tagScrollVisbile = ref(false);
const actionBarVisible = ref(true);
const curPage = ref(0);
const curTagScrollView = ref("");

const groupList = computed(() => store.state.portrait);

onLoad(async () => {
  await store.dispatch("fetchPortrait");
  const defaultSelected = groupList.value?.[0];
  selectedGroup.value = defaultSelected || [];
});

const onClickNextStep = () => {
  DraftStore.setTemplate(
    store,
    new DraftType.Template({
      id: selectedTemplate.value.id,
      name: selectedTemplate.value.name,
      target_image: selectedTemplate.value.target_image,
    })
  );

  uni.navigateTo({
    url: "/pages/draw/confirm",
  });
};

const onSelectGroup = (group) => {
  selectedGroup.value = group;
  const nextPage = groupList.value.findIndex(
    (item) => item.id == selectedGroup.value?.id
  );
  curPage.value = nextPage;
};

const onSelectTemplate = (template) => {
  selectedTemplate.value = template;
  onClickNextStep();
};

const handleSwiperChange = (current) => {
  const nextPage = current.detail.current;
  const groupId = groupList.value[nextPage].id;
  selectedGroup.value = groupList.value[nextPage];
  curPage.value = nextPage;
  if (current.detail.source == "touch") {
    curTagScrollView.value = groupId;
  }
};

onShareAppMessage(() => {
  return {
    title: "Luna AI写真",
    path: "/pages/draw/portrait",
  };
});
</script>

<style lang="scss" scoped>
@import "@/common/variable.scss";
.content {
  padding: 14px 0;
  height: 100%;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
}

.scroll-view_H {
  white-space: nowrap;
  width: 100%;
}

.scroll-view_Y {
  height: 100%;
}

.swiperWrap {
  height: calc(100vh - 64px);
}

.scroll-view_Y::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
}

.scroll-view_Y::-webkit-scrollbar-thumb {
  background-color: transparent;
  /* 设置滚动条颜色为透明 */
}

.group-wrap {
  display: flex;
  justify-content: flex-start;
  gap: 24rpx;
  width: max-content;
}

.group-list {
  margin: 0 40rpx 14px;
}

.tag-item {
  height: 26px;
  top: 102px;
  left: 92px;
  border-radius: 8px;
  padding: 0 16rpx;
  line-height: 26px;
  color: #8f8f8f;
  text-align: center;
  font-size: 14px;
}

.tag-selected {
  background: #c465ff;
  color: #ffffff;
  font-weight: 500;
}

.template-wrap {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  justify-items: center;
  align-items: center;
  gap: 12px;
  margin-right: 40rpx;
  margin-left: 40rpx;
  padding-bottom: 90rpx;
}

.template-wrap-padding {
  padding-bottom: 360rpx;
}

.selected-template-wrapper {
  position: relative;
}

.selected-template {
  width: 130rpx;
  height: 130rpx;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.selected-template-img {
  width: 130rpx;
  height: 130rpx;
}

.delete-icon {
  width: 32rpx;
  height: 32rpx;
  position: absolute;
  top: -12rpx;
  right: -8rpx;
  z-index: 10;
}

.delete-icon::before {
  content: "";
  position: absolute;
  top: -32rpx;
  right: -32rpx;
  bottom: -32rpx;
  left: -32rpx;
}

.selected-list-wrapper {
  display: flex;
  gap: 14rpx;
  margin-top: 22px;
  padding-bottom: 40px;
}

.template-item {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.template-item-img {
  width: 100%;
  height: 400rpx;
  border-radius: 8px 8px 0 0;
  background: $image-skeleton-background-pink-font-size-14;
}

.checked-icon {
  width: 24px;
  height: 24px;
  position: absolute;
  right: 8px;
  bottom: 8px;
}

.file-side {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.template-desc {
  height: 36rpx;
  z-index: 2;
  border-radius: 0 0 8px 8px;
  font-size: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  color: #000;
  background-color: #f4f4f4;
  gap: 2px;
  padding: 8px;

  .name {
    font-size: 14px;
    font-weight: 580;
  }
}

.selected-template-title {
  line-height: 18px;
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
  color: #000;
}

.action-wrapper .desc {
  color: #000000;
  font-size: 12px;
  font-weight: 500;
}

.main-btn {
  background: linear-gradient(171deg, #c465ff 1.8%, #8247ff 100%);
  color: #ffffff !important;
  width: 272rpx;
  border-radius: 8px;
  font-size: 22px;
  font-weight: 500;
  line-height: 96rpx;
  padding: 0;
  transform: scale(0.5) translate(50%);
  margin: 0;
}

.main-btn::after {
  border: none;
}

.main-btn-disabled {
  background: #f5f5f5;
  color: #b8b8b8 !important;
}

.action-bar {
  background-color: #f5f6f7;
  padding: 0 24rpx 0 16rpx;
  position: absolute;
  bottom: 0px;
  left: 0px;
  right: 0px;
  filter: drop-shadow(0px -1px 8px rgba(0, 0, 0, 0.25));
  border-radius: 14px 14px 0 0;
  transition: max-height 0.3s;
  max-height: 400rpx;
}

.action-bar-hidden {
  max-height: 80rpx;
  height: 80rpx;
}

.actionBarDisplayBtnWrap {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 14px;
  background: #f5f6f7;
  width: 120rpx;
  height: 36rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}

.actionBarDisplayBtnWrap::before {
  content: "";
  position: absolute;
  top: -18rpx;
  bottom: -18rpx;
  left: -10rpx;
  right: -10rpx;
}

.actionBarDisplayBtn {
  width: 34rpx;
  height: 19rpx;
  background-color: transparent;
  transition: transform 0.3s;
  transform-origin: center;
  transform: rotateZ(180deg);
}

.closeStatusBtn {
  transform: rotate(0deg);
}
</style>
