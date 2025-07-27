<template>
  <view class="example">
    <view v-if="isForm">
      <!-- 基础用法，不包含校验规则 -->
      <uni-forms ref="baseForm" :modelValue="baseFormData" :rules="rules">
        <uni-forms-item label="收件人" required name="reveiver">
          <uni-easyinput
            v-model="baseFormData.reveiver"
            placeholder="请输入姓名" />
        </uni-forms-item>
        <uni-forms-item label="手机号" required name="phone">
          <uni-easyinput
            v-model="baseFormData.phone"
            placeholder="请输入手机号" />
        </uni-forms-item>
        <uni-forms-item label="所在地区" required>
          <mosowe-cascade
            :required="true"
            v-model="noDefaultValue"
            :list="firstList"
            @nodeClick="nodeClick"
            @confirm="confirm"></mosowe-cascade>
        </uni-forms-item>
        <uni-forms-item label="详细地址">
          <uni-easyinput
            type="textarea"
            v-model="baseFormData.address"
            placeholder="请输入详细地址" />
        </uni-forms-item>
        <!-- <checkbox-group>
        <label>
          <checkbox value="is_default" :checked="baseFormData.is_default" />
          设为默认地址
        </label>
      </checkbox-group> -->
        <uni-data-checkbox
          multiple
          v-model="baseFormData.is_default"
          :localdata="hobby"></uni-data-checkbox>
      </uni-forms>
      <view class="fixedView">
        <button
          class="button name-btn-big"
          type="default"
          @tap="$debounceClick(saveAddress)()">
          保存地址
        </button>
      </view>
    </view>

    <view v-else>
      <view v-for="(item, index) in baseAddress" :key="index">
        <view
          class="addItemCard"
          :class="currentTmpIndex === index ? 'purpleBo' : ''"
          @tap="$debounceClick(chooseAddress)(item, index)">
          <view class="text1">{{ item.reveiver }}&emsp;{{ item.phone }}</view>
          <view class="text2">
            {{
              `${item.province_name}${item.city_name}${item.area_name}${item.address}`
            }}
          </view>
          <view class="space-b-flex">
            <view @tap.stop="$debounceClick(setDefaultAddress)(item, index)">
              <label>
                <radio :value="item.uuid" :checked="index === current" />
                <text>默认地址</text>
              </label>
            </view>
            <view class="">
              <button
                class="mini-btn"
                type="default"
                @tap.stop="$debounceClick(deleteAddress)(item)"
                size="mini">
                删除
              </button>
              <button
                class="mini-btn orderBtn marginLeft12"
                type="default"
                @tap.stop="$debounceClick(edit)(item)"
                size="mini">
                编辑
              </button>
            </view>
          </view>
        </view>
      </view>

      <view class="fixedView">
        <button
          class="button name-btn-big"
          type="default"
          @tap="$debounceClick(addAddress)()">
          新增地址
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { useStore } from "vuex";
import { onLoad, onShareAppMessage } from "@dcloudio/uni-app";
import {
  getCityList,
  createAddress,
  updateAddress,
  getAddressList,
  getAddressDetail,
  delAddress,
  setDefault,
} from "../../api/address";
// import MosoweCascade from "@/uni_modules/mosowe-cascade/components/mosowe-cascade/mosowe-cascade";

const store = useStore();

const baseAddress = computed(() => store.state.addressList.list);
const isForm = ref(true);

const current = ref(0); //默认地址index，后端排序了第一个就是
const currentTmpIndex = ref(-1); //临时选中
const baseForm = ref();
const baseFormData = ref({
  reveiver: "",
  phone: "",
  is_default: [], //false,
  address: "",
});
const rules = ref({
  reveiver: {
    rules: [
      {
        required: true,
        errorMessage: "姓名不能为空",
      },
    ],
  },
  phone: {
    rules: [
      {
        required: true,
        errorMessage: "手机号不能为空",
      },
    ],
  },
});
const hobby = ref([
  {
    text: "设为默认地址",
    value: 1,
  },
]);
const addressUUId = ref();
const PCD_uuid = ref();

// 无默认数据
const noDefaultValue = ref([]);
const firstList = ref([
  // {
  //   text: "初始-1",
  //   value: 1,
  //   pid: 0,
  //   isLeaf: false,
  //   children: [],
  // },
]);
const getDefaultAddress = () => {
  store.dispatch("fetchAddressList", { page: 1 });
};

onLoad(async (option) => {
  if (option.uuid) {
    addressUUId.value = option.uuid;
  } else {
    isForm.value = false;
    getDefaultAddress();
    // getAddressList({ page: 1, size: 20 }).then((res) => {});
  }
  getCityList({ depth: 1 }).then((res) => {
    firstList.value = res.data.items.map((x) => {
      return {
        text: x.name,
        value: x.region_id,
        pid: x.region_id + "_0",
        isLeaf: false,
        children: [],
      };
    });
  });
});
const nodeClick = (e, level, callBack) => {
  if (level >= 3) {
    callBack([]);
  } else {
    getCityList({ depth: level + 1, region_id: e.value }).then((res) => {
      const list = res.data.items.map((x) => {
        return {
          text: x.name,
          value: x.region_id,
          pid: e.value, //x.region_id + "_" + level,
          isLeaf: level >= 2 ? true : false,
          children: [],
        };
      });
      callBack(list);
    });
  }

  // setTimeout(() => {
  //   const list = Array.from({ length: 20 }).map((item, index) => {
  //     return {
  //       text: `${e.text}(${index})-${level}`,
  //       value: e.value + "-" + index,
  //       isLeaf: level >= 2 ? true : false,
  //       pid: e.value,
  //       children: [],
  //     };
  //   });
  //   debugger;
  //   callBack(list);
  // }, 1000);
};
const confirm = (data) => {
  console.log(data);
  PCD_uuid.value = {
    province_id: data[0]?.value || "",
    city_id: data[1]?.value || "",
    area_id: data[2]?.value || "",
  };
};
const chooseAddress = (item, index) => {
  currentTmpIndex.value = index;
  store.commit("setTempAddressUuid", item.uuid);
  
  setTimeout(() => {
    uni.navigateBack();
  }, 300);
};
const addAddress = () => {
  isForm.value = true;
  addressUUId.value = "";
};
const saveAddress = () => {
  let data = {
    ...baseFormData.value,
    is_default: baseFormData.value.is_default.length,
    ...PCD_uuid.value,
  };
  console.log(data);
  baseForm.value.validate().then((res) => {
    //console.log("success", res);
    if (addressUUId.value) {
      updateAddress(data, addressUUId.value).then((res) => {
        if (res.code === 20000) {
          uni.navigateBack();
        }
      });
    } else {
      createAddress(data).then((res) => {
        if (res.code === 20000) {
          isForm.value = false;
          getDefaultAddress();
        }
      });
    }
  });
  return;
};
const edit = (item) => {
  isForm.value = true;
  noDefaultValue.value = [
    { text: item.province_name, value: item.province_id },
    { text: item.city_name, value: item.city_id },
    { text: item.area_name, value: item.area_id },
  ];
  baseFormData.value = { ...item, is_default: [item.is_default] };
  addressUUId.value = item.uuid;

  // getAddressDetail(item.uuid).then((res) => {
  //   if (res.code === 20000) {
  //     //baseForm.value
  //     baseFormData.value = { ...res.data, is_default: [res.data.is_default] };
  //     addressUUId.value = item.uuid;
  //   }
  // });
};
const deleteAddress = (item) => {
  delAddress(item.uuid).then((res) => {
    if (res.code === 20000) {
      getDefaultAddress();
    }
  });
};
const setDefaultAddress = (item, index) => {
  current.value = index;
  setDefault(item.uuid).then((res) => {
    if (res.code === 20000) {
      //getDefaultAddress();
    }
  });
};
</script>

<style lang="scss" scoped>
.example {
  padding: 32rpx;
}

.addItemCard {
  border: 1px solid #bbb;
  border-radius: 8px;
  padding: 4px 10px;
  margin-bottom: 16px;
}
.purpleBo {
  border-color: #8537ee;
}
.text1 {
  font-weight: 500;
  font-size: 30rpx;
  color: #333333;
  line-height: 44rpx;
  margin: 10px 0;
}
.text2 {
  font-size: 24rpx;
  color: #999999;
  line-height: 34rpx;
  margin-bottom: 10px;
}
</style>
