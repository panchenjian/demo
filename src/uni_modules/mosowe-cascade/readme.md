# mosowe-cascade

`uniapp`/`uni_modules组件` ::: tip 支持本地，懒加载  
依赖组件：uni-popup :::

## 兼容性

| 平台 | android | ios | 微信小程序 | H5  |
| ---- | :-----: | :-: | :--------: | :-: |
| 兼容 |    √    |  √  |     √      |  √  |

## props

| 属性        |          类型           | 说明                   |    默认    |
| :---------- | :---------------------: | :--------------------- | :--------: |
| modelValue  | [listItem](#listitem)[] | 已选值                 |     -      |
| list        | [listItem](#listitem)[] | 展示列表               |     -      |
| popupTitle  |         string          | 级联弹框标题           |   请选择   |
| placeholder |         string          | 未选择时文本框占位文案 |   请选择   |
| local       |         boolean         | 本地数据，非懒加载     |   false    |
| parentKey   |         string          | 父级节点               |   'pid'    |
| label       |         string          | 文案字段               |   'text'   |
| value       |         string          | 值字段                 |  'value'   |
| children    |         string          | 子集字段               | 'children' |

## listItem

| 属性     |                 类型                  | 说明         |
| :------- | :-----------------------------------: | :----------- |
| text     |                string                 | 选项文案     |
| value    |           string \| number            | 值           |
| pid      | string \| number \| null \| undefined | 父级 id      |
| isLeaf   |                boolean                | 是否叶子节点 |
| children |        [listItem](#listitem)[]        | 子集列表     |

## emits

| 事件名 | 说明 |
| :-- | :-- |
| confirm | 点击弹框确定的时候触发，参数为当前已选值：(data:[listItem](#listitem)[])=>void |
| nodeClick | 节点点击，三个参数，一个当前节点 node，当前层级值 level，回调函数 callBack，回调函数接收一个数组用于下一级展示：(node: [listItem](#listitem) \| null, level: number, callBack: (data:[listItem](#listitem)[]) => void) => void |

## slots

| 插槽名  |    说明    |
| :------ | :--------: |
| default | 文本域插槽 |

## 示例代码

```vue
<template>
  <view class="title">懒加载，无默认数据</view>
  <mosowe-cascade
    v-model="noDefaultValue"
    :list="firstList"
    @nodeClick="nodeClick"
    @confirm="confirm"></mosowe-cascade>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// 无默认数据
const noDefaultValue = ref([]);
const firstList = ref([
  {
    text: '初始-1',
    value: 1,
    pid: 0,
    isLeaf: false,
    children: []
  },
  {
    text: '初始-2',
    value: 2,
    pid: 0,
    isLeaf: false,
    children: []
  }
]);
const nodeClick = (e: any, level: number, callBack: (data: any[]) => void) => {
  setTimeout(() => {
    const list = Array.from({ length: 20 }).map((item: any, index: number) => {
      return {
        text: `${e.text}(${index})-${level}`,
        value: e.value + '-' + index,
        isLeaf: level >= 2 ? true : false,
        pid: e.value,
        children: []
      };
    });
    callBack(list);
  }, 1000);
};
const confirm = (data) => {
  console.log(data);
};
</script>
```
