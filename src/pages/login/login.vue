<template>
  <view class="content">
    <view class="main">
      <image
        src="/static/logo.png"
        style="width: 211rpx; height: 211rpx"
      ></image>
      <view class="title">{{ $t("draw-bootstrap.title") }}</view>
    </view>
    <button
      class="main-button main-btn"
      :style="$getMediumFontWeight()"
      @tap="$debounceClick(requestAuthLogin)('weixin')"
    >
      微信授权登录
    </button>
	<view class="text-button-link" @tap="onGoToIndex">
		暂不登录
	</view>
    <view class="user-privacy-wrap">
      <checkbox-group @change="handleCheckboxChange">
        <checkbox
          :value="agreeTerms"
          color="#C465FF"
          style="transform: scale(0.8)"
        ></checkbox>
      </checkbox-group>
      <view class="text-span" :style="$getMediumFontWeight()">
        我已阅读并同意
        <view class="text-span-link" @tap="showAgreement(1)">《用户协议》</view>
        和
        <view class="text-span-link" @tap="showAgreement(2)">《隐私协议》</view>
      </view>
    </view>
    <privacy-dialog :title="agreementTitle" ref="agreementDialog">
      <div v-html="agreementContent"></div>
      <template #footer>
        <view class="agreement-footer">
          <button class="agreement-button" @tap="closeDialog">我同意</button>
        </view>
      </template>
    </privacy-dialog>
  </view>
</template>

<script>
import { mnpLogin } from "../../api/user";
import { getPolicy } from "../../api/faceSwap";
import { logoIcon } from "../../common/svgBase64.js";
import PrivacyDialog from "../../components/PrivacyDialog.vue";
import { getVipCount } from "../../api/user";
import { mapMutations } from "vuex";

export default {
  data() {
    return {
      agreeTerms: false,
      redirect: "",
      delta: 0,
      redirectTab: "",
      logoIcon,
      agreementContent: "",
      agreementTitle: "",
      policy: {
        privacy: "",
        service: "",
      },
    };
  },
  components: {
    PrivacyDialog,
  },
  onLoad(option) {
    uni.setNavigationBarColor({
      frontColor: "#ffffff",
      backgroundColor: "#f5f6f7",
    });

    this.redirect = decodeURIComponent(option.redirect);
    this.delta = decodeURIComponent(option.delta);
    this.redirectTab = decodeURIComponent(option.redirectTab);

    getPolicy({
      type: "privacy",
    }).then((res) => {
      this.policy.privacy = res?.data;
    });

    getPolicy({
      type: "service",
    }).then((res) => {
      this.policy.service = res?.data;
    });
  },
  methods: {
	  ...mapMutations(['setBalance_draw']),
    handleCheckboxChange(e) {
      this.agreeTerms = e.detail.value.length > 0;
    },
    showAgreement(type) {
      if (type === 1) {
        this.agreementContent = this.policy.privacy?.content;
        this.agreementTitle = this.policy.privacy?.title;
      } else {
        this.agreementContent = this.policy.service?.content;
        this.agreementTitle = this.policy.service?.title;
      }
      this.$refs.agreementDialog.open();
    },
    closeDialog() {
      this.$refs.agreementDialog.close();
    },
    onLoginSuccess(loginRes) {
      console.log(loginRes, "login res");
      if (loginRes.code !== 20000) {
        uni.showToast({
          title: loginRes.msg,
        });
        return;
      }
      uni.setStorageSync("token", loginRes.data.token);
      uni.showToast({
        title: "登录成功",
      });
	  getVipCount().then((res) => {
	    this.setBalance_draw(res.Data?.number || 0);
	  });
      if (this.redirectTab) {
        uni.switchTab({
          url: this.redirectTab,
        });
      } else if (this.delta != 0) {
        uni.navigateBack({
          delta: this.delta,
          success: () => {
            uni.$emit("navigating_back:from_page_login");
          },
        });
      } else if (this.redirect) {
        uni.navigateTo({
          url: this.redirect,
        });
      } else {
        console.log("fall back to index page");
        uni.switchTab({
          url: "/pages/index/index",
        });
      }
    },
    requestAuthLogin(provider) {
      if (!this.agreeTerms) {
        uni.showToast({
          title: "请先勾选同意用户协议",
          icon: "none",
        });
        return;
      }

      uni.login({
        provider: provider,
        success: async (authRes) => {
          mnpLogin({ code: authRes.code })
            .then(this.onLoginSuccess)
            .catch((err) => {
              console.log(err);
            });
          console.log(authRes);
        },
        fail: (err) => {
          console.log(err);
        },
        complete: () => {},
      });
    },
	onGoToIndex(){
		uni.switchTab({
		  url: "/pages/index/index",
		});
	}
  },
};
</script>

<style lang="scss" scoped>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  position: relative;
  height: 100%;
  box-sizing: border-box;
  background-color: #f5f6f7;

  .main-btn {
    bottom: 312rpx;
  }
}

.main {
  width: 100%;
  display: flex;
  flex-direction: column;
  position: absolute;
  align-items: center;
  left: 50%;
  transform: translate(-50%, 0);
  top: 510rpx;
  z-index: 2;
}

.title {
  margin-top: 20rpx;
  white-space: nowrap;
  color: #000;
  text-align: center;
  font-size: 12px;
  line-height: 36rpx;
  letter-spacing: 2px;
}

.user-privacy-wrap {
  position: absolute;
  bottom: 174rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10rpx;
  font-weight: 500;

  .text-span {
    font-size: 24rpx;
    display: flex;

    &-link {
      color: #c465ff;
      margin: 0 6rpx;
    }
  }
}

.agreement-content {
  white-space: pre-wrap;
}

.agreement-button {
  background: linear-gradient(171deg, #c465ff 1.8%, #8247ff 100%);
  color: #ffffff !important;
  width: 70%;
  border-radius: 8px;
  padding: 0;
  margin: 0;
}

.agreement-footer {
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  height: 40px;
  margin-top: 20px;
}
</style>
