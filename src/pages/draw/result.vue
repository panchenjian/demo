<template>
  <view :class="getTheme()" class="content">
    <view>
      <view v-if="!processReady">
        <view class="nickname-wrap">
          <image
            :src="userDraft?.template?.target_image || '/static/user.png'"
            class="avatar-img"
            mode="widthFix"></image>
          <view>
            <text class="currTemplateName">
              {{ userDraft?.template?.name }}
            </text>
          </view>
        </view>
        <view class="processBox">
          <view class="" v-if="failBuild">
            <image src="/static/build-fail.png" class="failBuildImg"></image>
          </view>
          <view class="" v-else>
            <l-liquid
              v-model:current="modelVale"
              :percent="target"
              waveColor="#B37DF5"
              innerColor="#DDD3FC">
              <text>{{ modelVale }}%</text>
            </l-liquid>
          </view>

          <view class="text-center" :class="failBuild ? 'redTxt' : ''">
            {{
              failBuild
                ? "设计失败，请重新选择图片设计"
                : "手办设计中，请耐心等待"
            }}
          </view>
        </view>
        <image src="/static/stepTitle.png" class="step-title"></image>
        <view class="step-box">
          <view class="line" />
          <view class="step-content">
            <view v-for="(item, index) in list1" :key="index">
              <view>
                <image
                  :src="`/static/step${index + 1}.png`"
                  class="stepIcon"></image>
                <view :class="stepActive >= index ? 'acitve' : 'not-active'">
                  {{ item.title }}
                </view>
              </view>
            </view>
          </view>
          <!-- <uni-steps
          :options="list1"
          active-icon="checkbox"
          :active="stepActive" /> -->
          <view class="shuoming">— 生成过程说明 —</view>
        </view>
      </view>
      <view v-else>
        <swiper
          class="swiperWrap"
          :current="currentPage"
          :autoplay="false"
          @change="handleSwiperChange">
          <swiper-item
            v-for="(item, index) in resultImageList"
            :key="index"
            class="swiper-item">
            <view class="result-image-wrap">
              <image
                :src="item.result_image"
                mode="widthFix"
                class="result-image"
                @tap="$debounceClick(handleClickImage)(item)"></image>
            </view>
          </swiper-item>
        </swiper>

        <view class="footerTips">
          <text>{{ t("draw-detail.tip") }}</text>
        </view>
        <view class="toggle-box" @tap="toggleExp">
          <text class="">
            <text class="title-coll">定制说明</text>
            <text class="small-title">流程 材质</text>
          </text>

          <image src="/static/goArrow.png" class="arrow-icon"></image>
        </view>
        <view class="toggle-box">
          <text class="">
            <text class="title-coll">常见问题</text>
          </text>

          <image src="/static/goArrow.png" class="arrow-icon"></image>
        </view>
        <!-- <uni-collapse ref="collapse">
        <uni-collapse-item @tap="toggleExp">
          <template v-slot:title>
            <text class="title-coll">定制说明</text>
            <text class="small-title">流程 材质</text>
          </template>
          <view class="content">
            <text class="text"></text>
          </view>
        </uni-collapse-item>
        <uni-collapse-item>
          <template v-slot:title>
            <text class="title-coll">常见问题</text>
          </template>
          <view class="content">
            <text class="text">
              折叠内容主体，这是一段比较长内容。默认折叠主要内容，只显示当前项标题。点击标题展开，才能看到这段文字。再次点击标题，折叠内容。
            </text>
          </view>
        </uni-collapse-item>
      </uni-collapse> -->
        <view class="toolBar">
          <!-- <view class="toolBarItemWrap">
          <button class="btnWrap" open-type="share">
            <image :src="blackShareIcon"></image>
            <text class="" :style="$getMediumFontWeight()">
              {{ t("draw-detail.share-btn") }}
            </text>
          </button>
        </view>
        <view
          class="toolBarItemWrap"
          @tap="
            $debounceClick(onSaveImage)([
              resultImageList[currentPage].result_image,
            ])
          ">
          <image :src="blackDownloadIcon"></image>
          <text class="" :style="$getMediumFontWeight()">
            {{ t("draw-detail.download-btn") }}
          </text>
        </view> -->
        </view>
        <!-- 在页面最下方添加占位视图，高度等于 tabBar 的高度 -->
        <view class="edgeInsetBottom"></view>
        <!-- 绝对定位的视图需要考虑 tabBar 遮挡的问题，bottom 应该加上 tabBar 的高度 -->
        <view class="fixedView">
          <button class="button name-btn-big" type="default" @click="togglePay">
            购买手办
          </button>
          <view>
            <page-meta
              :page-style="
                'overflow:' + (show ? 'hidden' : 'visible')
              "></page-meta>
            <!-- 普通弹窗 -->
            <uni-popup
              ref="payPopup"
              background-color="#fff"
              @change="change"
              border-radius="10px 10px 0 0"
              type="bottom">
              <view class="popup-content">
                <view class="text-center">
                  定制说明
                  <icon type="clear" class="closeIcon" @tap="closeExp"></icon>
                </view>
                <view class="blod">产品规格</view>
                <text class="">
                  <text class="text">材质：环保树脂</text>
                  <text class="text">尺寸：以下单页所选尺寸规格为准</text>
                </text>
                <view class="blod">定制流程</view>
                <view class="">
                  <text class="text">
                    用户设计：用户上传个人图片，选择喜欢的设计风格，生成满意的效果图
                  </text>
                  <text class="text">
                    深化设计：下单后，设计师基于用户效果图进行3D建模及设计深化，输出3D白模
                  </text>
                  <text class="text">
                    手办制作：工厂根据设计师深化设计后的模型，进行手办制作生产，得到最终手办成品
                  </text>
                </view>
                <view class="blod">注意事项</view>
                <view class="">
                  <text class="text">
                    用户设计生成效果图仅为展示效果，实物请以手办制作流程中实物图为准
                  </text>
                  <text class="text">
                    本产品为定制类产品，一旦进入手办制作环节，非工艺缺陷、质量类问题，售出不可退换
                  </text>
                  <text class="text">
                    因工艺特性因素，成品可能存在轻微像素噪点
                  </text>
                </view>
                <view class="blod">声明条款</view>
                <view class="text">实物颜色与屏幕存在合理色差</view>
              </view>
            </uni-popup>
            <wu-sku
              v-model="skuShow"
              :data="skus"
              :themeColor="[133, 55, 238]"
              priceRGB="#F22828"
              :defaultCover="
                userDraft?.template?.target_image ||
                'http://gips2.baidu.com/it/u=1674525583,3037683813&fm=3028&app=3028&f=JPEG&fmt=auto?w=1024&h=1024'
              "
              :totalMny="comPrice"
              btnConfirmText="立即支付"
              notSelectSku="请选择完整的商品信息"
              @skuChange="skuChange"
              @numChange="numChange"
              @confirm="skuConfirm">
              <template #header>
                <view class="placeBox" @tap="$debounceClick(jumpAddress)()">
                  <image src="/static/localIcon.png" class="localIcon"></image>
                  <view class="flex-1">
                    <view class="placeOne">
                      {{ isDefaultAddress?.province_name }}
                      {{ isDefaultAddress?.city_name }}
                      {{ isDefaultAddress?.area_name }}
                      {{ isDefaultAddress?.address }}
                    </view>
                    <view class="placeTwo">
                      {{ isDefaultAddress?.reveiver }}
                      {{ isDefaultAddress?.phone }}
                    </view>
                  </view>
                  <image
                    src="/static/arrowLine.png"
                    class="arrowLineIcon"></image>
                </view>
              </template>
              <template #body>
                <view class="priceDetail">
                  <view class="txtBoldTitle">价格明细</view>
                  <view class="default-label-txt space-b-flex">
                    <text>商品总价</text>
                    <text>
                      ￥
                      <text class="txtBig">{{ selectSku.price * buyNum }}</text>
                    </text>
                  </view>
                  <view class="default-label-txt space-b-flex" v-if="cal_price">
                    <text>运费</text>
                    <text>
                      ￥
                      <text>{{ cal_price }}</text>
                    </text>
                  </view>
                  <hr class="lightLine" />
                  <view class="default-label-txt space-b-flex">
                    <text>合计</text>
                    <text class="theme-main-color">
                      ￥
                      <text class="txtBig">
                        {{
                          selectSku.price
                            ? new Big(selectSku.price)
                                .times(buyNum)
                                .plus(new Big(cal_price))
                            : 0
                        }}
                      </text>
                    </text>
                  </view>
                </view>
              </template>
            </wu-sku>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import { useI18n } from "vue-i18n";
import Big from "big.js";
import { requestAuthThenSaveImages } from "../../utils/common";
import { blackDownloadIcon, blackShareIcon } from "../../common/svgBase64";
import { defaultLoadingTitle } from "../../common/variable.js";
import { osName } from "../../context.js";
import { AblumStore, AblumType } from "../../store/album";
import { DraftStore } from "../../store/draft";
import { onLoad, onShow, onUnload, onShareAppMessage } from "@dcloudio/uni-app";
import { createProcess, getSku } from "../../api/faceSwap.js";
import { submitProdOrder, getExpressPrice } from "../../api/order.js";
import { queryPayStatus, requestPrepay } from "../../api/pay";
import LLiquid from "@/uni_modules/lime-liquid/components/l-liquid/l-liquid.vue";

const store = useStore();
const { t } = useI18n();

const intervalId = ref(null);
const stepActive = ref(1),
  list1 = ref([
    {
      title: "用户设计",
    },
    {
      title: "深化设计",
    },
    {
      title: "手办制作",
    },
    {
      title: "用户验收",
    },
  ]);

const target = ref(1);
const modelVale = ref(0);

const baseAddress = computed(() => store.state.addressList.list);

const userChooseTemplate_uuid = computed(() => store.state.tempUuid);
const userDraft = computed(() => DraftStore.getDraft(store));
let leavePage = false;
const processReady = ref(false);

// 定义响应式数据
const resultImageList = ref([]);

const currentPage = ref(0);
// const currentTemplateName = computed(() => {
//   return resultImageList.value[currentPage.value]?.template_name;
// });
const currentAddressUuid = computed(() => {
  return store.state.tempAddressUuid;
});
const isDefaultAddress = computed(() => {
  let default_address = baseAddress.value.find((x) => {
    if (currentAddressUuid.value) {
      return x.uuid === currentAddressUuid.value;
    } else {
      return x.is_default;
    }
  });
  return default_address?.uuid
    ? default_address
    : {
        address: "请选择收货地址",
      };
});

const failBuild = ref(false);
const pollingFinished = ref(false);
const production_uuid = ref("");
const photoAlbumType = ref("");
const hasAlbumWritePermission = ref(true);
const fakeProcess = () => {
  setTimeout(() => {
    target.value = Math.max(Math.min(100, target.value + 20), 0);
    if (target.value < 100) {
      fakeProcess();
    } else {
      //return;
      processReady.value = true; //
      AblumStore.setImageList(store, [
        new AblumType.ImageItem({
          result_image: "https://modao.cc/res-img/org/ppl/1.jpg",
          template_name: "3D动画定制手办",
        }),
      ]);
      resultImageList.value = AblumStore.getImageList(store);
      currentPage.value = AblumStore.getPreviewImageIndex(store) || 0;
    }
  }, 1000);
};
const getProcess = (uuid) => {
  createProcess(uuid).then((res) => {
    if (res.code === 0) {
      if (res.data.status === 4) {
        failBuild.value = true;
        return;
      }
      if (res.data.process < 100) {
        target.value = res.data.process;
        stepActive.value = res.data.status - 1;
        !leavePage && setTimeout(() => getProcess(uuid), 1500);
      } else {
        processReady.value = true;
        AblumStore.setImageList(store, [
          new AblumType.ImageItem({
            result_image: res.data.image_2d,
            template_name: res.data.template_name,
          }),
        ]);
        setTimeout(() => {
          resultImageList.value = AblumStore.getImageList(store);
          currentPage.value = AblumStore.getPreviewImageIndex(store) || 0;
        }, 300);
      }
    }
  });
};
// 页面生命周期钩子
onLoad((option) => {
  //fakeProcess(); //
  getProcess(option.uuid);
  leavePage = false;
  production_uuid.value = option.uuid;
  photoAlbumType.value = "";
  resultImageList.value = AblumStore.getImageList(store);
  currentPage.value = AblumStore.getPreviewImageIndex(store) || 0;

  getDefaultAddress();
});
// onShow(() => {
//   setCalPrice();
// });
watch(isDefaultAddress, (newValue, oldValue) => {
  //console.log("doubleCount changed ", oldValue, newValue);
  if (oldValue.uuid !== newValue.uuid) {
    setCalPrice();
  }
});
onUnload(() => {
  leavePage = true;
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

const toggleExp = () => {
  payPopup.value.open("bottom");
};
const closeExp = () => {
  payPopup.value.close();
};
const payPopup = ref(null);
const togglePay = () => {
  skuShow.value = true;
  getSkuItems();
};
const getDefaultAddress = () => {
  store.dispatch("fetchAddressList", { page: 1 });
};
const show = ref(false);
const change = (e) => {
  show.value = e.show;
};
let cal_price = ref(0); //运费
let skuShow = ref(false);
let selectSku = ref({ price: 0 });
let buyNum = ref(1);
const comPrice = computed(() => {
  return selectSku.value.price
    ? Number(
        new Big(selectSku.value.price)
          .times(buyNum.value)
          .plus(new Big(cal_price.value))
      )
    : 0;
});
const setCalPrice = () => {
  const default_address = isDefaultAddress.value; //baseAddress.value.find((x) => x.is_default);
  if (default_address.uuid) {
    getExpressPrice(default_address.uuid).then((res) => {
      cal_price.value = new Big(res?.data?.price).div(100) || 8;
    });
  }
};
// sku列表
let skus = ref([
  // {
  //   id: 1,
  //   price: 7000,
  //   stock: 30,
  //   sku_attrs: {
  //     机身颜色: "深空黑色",
  //     储存容量: "128G",
  //     套装: "快充套装",
  //   },
  // },
]);
const getSkuItems = () => {
  getSku().then((res) => {
    let { specs, sku } = res.data;
    let tmpObj = {};
    let attrs = specs.map((x, index) => {
      tmpObj[x.uuid] = x.group_name;
      let tmpChild = {};
      x.items.map((y) => {
        tmpChild[y.uuid] = y.title;
        return y;
      });
      tmpObj[index + "items"] = tmpChild;
      return x.group_name;
    });
    let tSkus = sku.map((item, index) => {
      let tmpAttr = {};
      item.spec.map((z, index) => {
        tmpAttr[attrs[index]] = tmpObj[index + "items"][z];
        //tmpAttr[tmpObj[item.spec[index]]] = tmpObj[index + "items"][z];
      });
      return {
        id: item.uuid,
        price: new Big(item.price).div(100),
        stock: item.stock,
        sku_attrs: tmpAttr,
      };
    });
    skus.value = tSkus;
  });
};
let numChange = (num) => {
  buyNum.value = num;
};
// sku发生改变事件, 选择完整的sku则回返回 否则sku的值为{}
let skuChange = (sku) => {
  console.log(sku);
  selectSku.value = sku;

  setCalPrice();
};
// sku确认事件
let skuConfirm = (e) => {
  console.log(e); //sku, skuText , num
  submitOrder(e);
};

const jumpAddress = () => {
  uni.navigateTo({
    url: "/pages/address/index",
  });
};

const showLoadingOverlay = async (orderID) => {
  pollingFinished.value = false;
  uni.showLoading({ title: "确认支付结果中" });

  intervalId.value = setInterval(async () => {
    try {
      const res = await queryPayStatus(orderID);
      if (res.code !== 20000) {
        throw new Error(res.msg || "服务器开小差了");
      }
      //debugger;
      if (res.data.order_status === 2) {
        clearInterval(intervalId.value);
        uni.hideLoading();
        !pollingFinished.value && onPaySuccess(orderID);
        pollingFinished.value = true;
      }
    } catch (error) {
      clearInterval(intervalId.value);
      uni.hideLoading();
      pollingFinished.value = true;
      uni.showToast({
        title: error.message,
        icon: "none",
      });
    }
  }, 800);
};

const onPaySuccess = async (orderID) => {
  await store.dispatch("fetchUserInfo");

  uni.showToast({
    title: "购买成功！",
    duration: 2000,
    mask: true,
  });

  setTimeout(() => {
    //uni.navigateBack();
    uni.navigateTo({
      url: "/pages/order/result?orderId=" + orderID,
    });
  }, 2000);
};
const submitOrder = async (e) => {
  try {
    const default_address = isDefaultAddress.value; //baseAddress.value.find((x) => x.is_default);

    if (!default_address.uuid) {
      uni.showToast({
        title: "您还没选择地址呢",
        icon: "none",
      });
      return;
    }

    const orderRes = await submitProdOrder({
      production_uuid: production_uuid.value,
      address_uuid: default_address?.uuid || "",
      sku_uuid: selectSku.value.id,
      number: e.num || 1,
      price:
        Number(
          new Big(selectSku.value.price)
            .times(e.num)
            .plus(new Big(cal_price.value))
        ) * 100, //selectSku.value.price * e.num + cal_price.value, //总价-展示除100，传后端还是要乘以100
      express_price: Number(new Big(cal_price.value).times(100)), //运费
    });
    if (orderRes.code !== 20000) {
      throw new Error(orderRes.msg || "服务器开小差了");
    }
    //pay_url  order_no
    //const orderID = orderRes.data.order_no;
    // const payRes = await requestPrepay({
    //   order_id: orderID,
    //   from: "recharge",
    //   pay_way: 2, // 微信小程序支付
    //   redirect: "/",
    // });

    // if (payRes.code !== 1) {
    //   throw new Error(payRes.msg || "服务器开小差了");
    // }
    const {
      order_no: orderID,
      app_id,
      nonce_str,
      package: req_package,
      pay_url,
      time_stamp,
      pay_sign,
      sign_type,
    } = orderRes.data;
    const payResConfig = {
      //"orderInfo": {
      appid: app_id, // 微信开放平台 - 应用 - AppId，注意和微信小程序、公众号 AppId 可能不一致
      nonceStr: nonce_str, // 随机字符串
      package: req_package, // 固定值
      prepayid: pay_url, // 统一下单订单号
      timeStamp: time_stamp, // 时间戳（单位：秒）
      paySign: pay_sign,
      signType: sign_type, // 签名，这里用的 MD5/RSA 签名
      // },
    };

    // #ifdef MP-WEIXIN
    uni.requestPayment({
      provider: "wxpay",
      ...payResConfig,
      success: () => {
        showLoadingOverlay(orderID);
      },
      fail: (err) => {
        if (err?.errMsg.includes("cancel")) return;
        uni.showToast({
          title: "支付失败" + (err?.errMsg ? "：" + err?.errMsg : ""),
          icon: "none",
        });
      },
    });
    // #endif
  } catch (error) {
    uni.showToast({
      title: error.message,
      icon: "none",
    });
  }
};
</script>

<style lang="scss" scoped>
@import "@/common/variable.scss";
@import "@/common/main.scss";
.content {
  height: 100%;
  padding: 40rpx 0;
  box-sizing: border-box;
  min-height: 600px;
}
.redTxt {
  color: #f22828 !important;
}
.failBuildImg {
  width: 140px;
  height: 128px;
}
.nickname-wrap {
  display: flex;
  gap: 16px;
  margin: 0 32rpx;
}
.avatar-img {
  width: 154rpx;
  height: 148rpx;
  border-radius: 32rpx 32rpx 32rpx 32rpx;
}
.text-center {
  text-align: center;
}
.text {
  display: block;
  padding-left: 18px;
  position: relative;
  &::before {
    content: "●";
    position: absolute;
    left: 0;
  }
}
.high40 {
  height: 40rpx;
}
.processBox {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
  width: 686rpx;
  height: 686rpx;
  background: #ffffff;
  border-radius: 32rpx 32rpx 32rpx 32rpx;
  border: 2rpx dashed #8537ee;
  margin: 40rpx 32rpx;
  .text-center {
    font-weight: 600;
    font-size: 32rpx;
    color: #000000;
  }
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
  height: 712rpx;
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
  font-weight: 600;
  font-size: 36rpx;
  color: #333333;
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
.toggle-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0rpx 32rpx;
  background: #f6f6f6;
  border-radius: 20rpx;
  margin: 40rpx 32rpx 0;
}
.small-title {
  color: #999;
  font-size: 24rpx;
  margin-left: 30px;
}
.title-coll {
  padding-left: 15px;
  font-size: 32rpx;
  font-weight: 500;
  color: #333;
  line-height: 48px;
}
.popup-content {
  padding: 32rpx;
  position: relative;
  line-height: 33px;
  height: 60vh;
  overflow: auto;
}
.closeIcon {
  position: absolute;
  right: 10px;
  top: 10px;
}
.step-title {
  width: 144rpx;
  height: 42rpx;
  margin: 0 32rpx 32rpx;
}
.step-box {
  padding-top: 50rpx;
  margin: 0 32rpx;
  .step-content {
    margin-top: -50rpx;
    display: flex;
    justify-content: space-between;
    .active {
      font-size: 28rpx;
      color: #000000;
      text-align: center;
    }
    .not-active {
      font-size: 28rpx;
      color: #999999;
      text-align: center;
    }
  }
}
.line {
  height: 1px;
  background-color: #cabffb;
}
.stepIcon {
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 24rpx;
}
.shuoming {
  text-align: center;
  margin-top: 30px;
  font-size: 28rpx;
  color: #999999;
}

.priceDetail {
  background: #fff;
  border-radius: 32rpx;
  padding: 20rpx 28rpx;
  margin-top: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
