<template>
  <view class="wrapper">
    <view class="content">
      <view class="left-image-list-wrapper image-list-wrapper">
        <view
          class="image-wrapper"
          v-for="(item, index) in leftList"
          :key="index"
        >
          <image
            :src="item.target_image"
            mode="widthFix"
            :lazy-load="true"
            @tap="onSelectTemplate(item)"
          ></image>
        </view>
      </view>
      <view class="image-list-wrapper">
        <view
          class="image-wrapper"
          v-for="(item, index) in rightList"
          :key="index"
        >
          <image
            :src="item.target_image"
            mode="widthFix"
            :lazy-load="true"
            @tap="onSelectTemplate(item)"
          ></image>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import { DraftStore, DraftType } from "../../store/draft";

const templateList = ref([]);
const selectedTemplate = ref(null);

const store = useStore();
const currGroupDetail = store.state.browseringGroupDetail;
templateList.value = currGroupDetail.templateList;

const leftList = computed(() => {
  if (!templateList.value) return [];
  return templateList.value.filter((_, index) => index % 2 === 0);
});

const rightList = computed(() => {
  if (!templateList.value) return [];
  return templateList.value.filter((_, index) => index % 2 !== 0);
});

const handleGenerateBtnClick = () => {
  if (!selectedTemplate.value) {
    uni.showToast({
      title: "请至少先选择1张模板",
      icon: "none",
    });
    return;
  }

  DraftStore.setTemplate(
    store,
    new DraftType.Template({
      id: selectedTemplate.value.id,
      name: selectedTemplate.value.name,
      target_image: selectedTemplate.value.target_image,
    })
  );

  uni.navigateTo({
    url: `/pages/draw/confirm`,
  });
};

const onSelectTemplate = (template) => {
  selectedTemplate.value = template;
  handleGenerateBtnClick();
};
</script>

<style lang="scss" scoped>
@import "@/common/variable.scss";

.wrapper {
  height: 100vh;
  background-size: 100%;
  flex-flow: column;
  overflow: hidden;
  box-sizing: border-box;
  padding: 12px 0;
  display: flex;
}

.content {
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
    image {
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
      image {
        width: 330rpx;
      }
    }

    .image-wrapper:nth-child(even) {
      image {
        width: 324rpx;
        height: 206px;
      }
    }
  }
}
</style>
