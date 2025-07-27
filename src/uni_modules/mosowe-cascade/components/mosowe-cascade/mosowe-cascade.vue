<template>
  <view class="async-load-cascader-componnet">
    <view
      class="show-text"
      @click="show">
      <slot :data="chooseData">
        <view class="show-title">
          <text class="text">{{ chooseData }}</text>
          <view class="icon">
            <image
              src="./icon-arrow.png"
              class="icon-image" />
          </view>
        </view>
      </slot>
    </view>
    <!-- 已选 -->
    <!-- 弹框 -->
    <uni-popup
      ref="popupRef"
      background-color="#fff"
      type="bottom"
      :mask-click="false"
      safe-area>
      <!-- 标题栏 -->
      <view class="popup-head">
        <view
          class="cancel btn"
          @click="popupCancel">
          取消
        </view>
        <view class="title">
          {{ popupTitle || '请选择' }}
        </view>
        <view
          class="confirm btn"
          @click="popupConfirm">
          确定
        </view>
      </view>
      <!-- 顶部已选展示 -->
      <view class="select-wrap">
        <view
          class="item"
          :class="{
            active: selectActive[props.value] === item[props.value] && !showNotice
          }"
          v-for="(item, index) in selectData"
          :key="item[props.value]"
          @click="selectNodeClick(item, index)">
          {{ item[props.label] }}
        </view>
        <!-- 请选择提示语 -->
        <view
          class="item item-notice"
          :class="{
            active: showNotice
          }"
          v-if="showNotice"
          @click.stop="">
          {{ notice.text }}
        </view>
      </view>
      <!-- 底部待选展示 -->
      <view class="list-wrap">
        <!-- loading -->
        <view
          class="loading"
          v-if="loading">
          <uni-icons
            type="spinner-cycle"
            size="16"></uni-icons>
        </view>
        <!-- 列表 -->
        <view
          class="list-content"
          v-else>
          <view
            class="item"
            v-for="item in showList"
            :key="item[props.value]">
            <!-- 圆圈选择器 -->
            <view
              class="item-circle"
              v-if="props.checkStrictly"
              @click="chooseItem(item)">
              <uni-icons
                type="circle-filled"
                size="20"
                v-if="listActive && listActive[props.value] === item[props.value]"></uni-icons>
              <uni-icons
                type="circle"
                size="20"
                v-else></uni-icons>
            </view>
            <!-- 内容区 -->
            <view
              class="item-content"
              @click="nodeClick(item)">
              <text class="text">{{ item[props.label] }}</text>
              <uni-icons
                type="checkmarkempty"
                size="20"
                v-if="
                  listActive &&
                  listActive[props.value] === item[props.value] &&
                  item[props.children]?.length &&
                  !props.checkStrictly
                "></uni-icons>
              <uni-icons
                type="right"
                size="20"
                v-if="item[props.children]?.length"></uni-icons>
            </view>
          </view>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup lang="ts">
/**
 * 懒加载数据
 * @ params
 *  modelValue： 初始值
 *  list: 首次加载列表，[{text,value,pid}]
 *  popupTitle：弹框标题
 *  placeholder：未选择时文本框占位文案
 *  local：本地数据，非懒加载
 * @ emits
 *  update:modelValue：v-model数据更新
 *  nodeClick：节点点击，三个参数，一个当前节点node，当前层级值，回调函数，回调函数接收一个数组用于下一级展示
 *  confirm：点击弹框确定的时候触发，参数为当前已选值
 */

import { ref, watch, watchEffect } from 'vue';

interface listItem {
  text: string;
  value: string | number;
  pid: string | number | null | undefined;
  children?: listItem[];
}
interface Props {
  modelValue: listItem[];
  list: listItem[]; // 初始化时数据列表
  popupTitle?: string;
  placeholder?: string;
  local?: boolean;
  checkStrictly?: boolean;
  required?: boolean;
  parentKey?: string;
  label?: string;
  value?: string;
  children?: string;
}
const props = withDefaults(defineProps<Props>(), {
  popupTitle: '请选择',
  placeholder: '请选择',
  local: false,
  checkStrictly: false,
  parentKey: 'pid',
  label: 'text',
  value: 'value',
  children: 'children'
});

// emits
interface EmitsType {
  (e: 'update:modelValue', data: listItem[]): void;
  (e: 'confirm', data: any): void;
  (e: 'nodeClick', node: listItem | null, index: number, cb: (data: any[]) => void): () => void; // 选中时触发事件
}
const emits = defineEmits<EmitsType>();

// 树转数组
const TreeToArray = (nodes: any, childKey: string = 'leaf'): any => {
  let stack = nodes,
    data: any = [];
  while (stack.length != 0) {
    let pop: any = stack.pop();
    data.push(pop);
    let children = pop[childKey];
    if (children) {
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i]);
      }
    }
  }
  return data;
};

const loading = ref(false);

// 展示的已选文案
const notice: listItem = {
  text: '请选择',
  value: ''
};
const chooseData = ref<string>(props.placeholder);
// 已选数据数组
const showNotice = ref(true);
const selectData = ref<any[]>([]);

watch(
  () => props.placeholder,
  (v: string) => {
    chooseData.value = v;
  }
);
// 弹框
const popupRef = ref(null);
const show = () => {
  popupRef.value!.open();
};
const close = () => {
  popupRef.value!.close();
};
// 作为点击取消时的重置数据
let initData: any = {
  showList: [],
  selectData: [],
  showNotice: true,
  listActive: null,
  selectActive: null
};
const popupConfirm = () => {
  if (props.required && !selectData.value.length) {
    uni.showToast({
      title: '请选择部门',
      icon: 'none',
      mask: true
    });
    return;
  }
  close();
  emits('confirm', [...selectData.value]);
  emits('update:modelValue', [...selectData.value]);
  initData = {
    showList: showList.value,
    selectData: [...selectData.value],
    showNotice: showNotice.value,
    listActive: listActive.value,
    selectActive: selectActive.value
  };
  if (selectData.value.length) {
    chooseData.value = selectData.value.map((item: any) => item[props.label]).join('/');
  } else {
    chooseData.value = props.placeholder;
  }
};
const popupCancel = () => {
  close();
  selectData.value = [...initData.selectData];
  showNotice.value = initData.showNotice;
  listActive.value = { ...initData.listActive };
  selectActive.value = { ...initData.selectActive };
  showList.value = [...initData.showList];
};

// 列展示的数据
const showList = ref<any[]>([]);
watchEffect(() => {
  if (!props.local && (!showList.value.length || showList.value[0] === props.list[0])) {
    showList.value = [...props.list];
  }
});

// 存储所有出现过的数据，不销毁页面时下次点击不再请求
let allList: listItem[] = [];
watchEffect(() => {
  if (!props.local) {
    const allIds = allList.map((item: listItem) => item[props.value]);
    showList.value.forEach((item: listItem) => {
      if (!allIds.includes(item[props.value])) {
        allList.push(item);
      }
    });
  }
});

// 待选列事件处理
const listActive = ref<listItem | null>(null);
const nodeClick = (node: listItem) => {
  if (!selectData.value.filter((item: listItem) => item[props.value] === node[props.value]).length) {
    const len = selectData.value.length;
    if (!len || node[props.parentKey] !== selectData.value[len - 1][props.parentKey]) {
      // 列表有改
      selectData.value.push(node);
    } else {
      selectData.value[len - 1] = node;
    }
  }
	// debugger;
	// console.log('来自内部');
	
	
	
  listActive.value = node;
  selectActive.value = node;

  if (node.isLeaf||node[props.children]?.length) {
    showNotice.value = false;
    return;
  }
  showNotice.value = true;
  const list = allList.filter((item: listItem) => item[props.parentKey] === node[props.value]);
  if (list.length) {
    showList.value = list;
    return;
  }
  if(node.isLeaf){//pcj
	  return;
  }
  loading.value = true;
  showNotice.value = true;
  
  emits('nodeClick', node, selectData.value.length, (data: listItem[]) => {
    loading.value = false;
    showList.value = data.map((item: listItem) => {
      return {
        ...item
      };
    });
  });
};
const chooseItem = (node: listItem) => {
  listActive.value = node;
  selectActive.value = node;
  showNotice.value = false;

  if (!selectData.value.filter((item: listItem) => item[props.value] === node[props.value]).length) {
    const len = selectData.value.length;
    if (!len || node[props.parentKey] !== selectData.value[len - 1][props.parentKey]) {
      // 列表有改
      selectData.value.push(node);
    } else {
      selectData.value[len - 1] = node;
    }
  }
};

// 已选列事件处理
const selectActive = ref<listItem>(notice);
const selectNodeClick = (node: listItem, index: number) => {
  selectData.value.splice(index);
  listActive.value = null;
  if (node[props.parentKey]) {
    showList.value = allList.filter((item: listItem) => item[props.parentKey] === node[props.parentKey]);
  } else {
    showList.value = allList.filter((item: listItem) => !item[props.parentKey]);
  }
  if (!showList.value.length) {
    loading.value = true;
    const list: listItem[] = [...selectData.value];
    const nodeThis = list.reverse()[0] || null;
    emits('nodeClick', nodeThis, selectData.value.length, (data: listItem[]) => {
      loading.value = false;
      showList.value = data.map((item: listItem) => {
        return {
          ...item
        };
      });
    });
  }
  selectActive.value = notice;

  if (index !== selectData.value.length - 1) {
    showNotice.value = true;
    return;
  }
};

// 初始传入值
watchEffect(() => {
  const lastData = [...props.modelValue].reverse()[0] || null;
  const initValue = [...props.modelValue];
  selectData.value = [...props.modelValue];
  initData.selectData = [...props.modelValue];
  chooseData.value = (initValue.map((item: any) => item[props.label]).join('/') || props.placeholder) as string;
  // 初始传入值有叶子节点
  if (lastData) {
    listActive.value = lastData;
    selectActive.value = lastData;

    initData.listActive = lastData;
    initData.selectActive = lastData;
    if (props.checkStrictly || !lastData[props.children]?.length) {
      showNotice.value = false;
      initData.showNotice = false;
    }
  }

  if (props.local) {
    if (!Array.isArray(props.list)) {
      console.error('mosowe-cascader：list必须是数组形式的tree结构');
      return;
    }
    allList = TreeToArray([...props.list], props.children).reverse();
    if (lastData) {
      let list: listItem[] = [];
      if (!lastData[props.children]?.length || props.checkStrictly) {
        // 含叶子节点
        list = allList.filter((item: listItem) => item[props.parentKey] === lastData[props.parentKey]);
      } else {
        // 不含叶子节点
        list = allList.filter((item: listItem) => item[props.parentKey] === lastData[props.value]);
      }
      showList.value = list;
      initData.showList = list;
    } else {
      showList.value = [...props.list];
      initData.showList = [...props.list];
    }
  }
});

defineExpose({
  close
});
</script>

<style lang="scss" scoped>
@import './mosowe-cascade.scss';
</style>
