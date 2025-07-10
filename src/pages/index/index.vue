<template>
	<view class="content">
		<view class="uni-margin-wrap">
			<swiper class="swiper" circular :indicator-dots="indicatorDots" :autoplay="autoplay" :interval="interval"
				:duration="duration">
				<swiper-item v-for="(group, index) in bannerList" :key="index">
					<view class="swiper-item uni-bg-red">
						<image :src="group.image_url" mode="aspectFill" :lazy-load="true"
							class="template-item-img"></image>
					</view>
				</swiper-item>
				
			</swiper>
		</view>
		<view class="group-list">
			<scroll-view class="scroll-view_H" scroll-x="true" :enhanced="true" :show-scrollbar="tagScrollVisbile"
				:scroll-into-view="'i' + curTagScrollView" scroll-with-animation="true">
				<view class="group-wrap">
					<view v-for="(group, index) in tempTitle" :key="group.uuid" :style="$getMediumFontWeight()"
						:id="'i' + group.uuid" :class="
              'tag-item ' +
              (group.uuid == selectedGroup?.uuid ? 'tag-selected' : '')
            " @tap="onSelectGroup(group)">
						{{ index == 0 ? `🔥 ` : "" }}{{ group.title }}
					</view>
				</view>
			</scroll-view>
		</view>
		<swiper class="swiperWrap" :current="curPage" height="100%" :autoplay="false" next-margin="0"
			@change="handleSwiperChange">
			<swiper-item v-for="(group, index) in tempTitle" :key="index">
				<scroll-view class="scroll-view_Y" scroll-y="true" scroll-with-animation="false" :enhanced="true"
					:show-scrollbar="false" @scrolltolower="lower(group)">
					<view class="template-wrap" :class="{ 'template-wrap-padding': actionBarVisible }">
						<view v-for="(template, index) in groupList" :key="index" class="template-item"
							@tap="$debounceClick(onSelectTemplate)(template)">
							<view style="display: flex; flex-direction: column">
								<image :src="template.cover" mode="aspectFill" :lazy-load="true"
									class="template-item-img"></image>
								<view class="template-desc">
									<view class="name">
										<text>{{ template.title }}</text>
										<text class="name-btn">去定制</text>
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
	import {
		computed,
		ref
	} from "vue";
	import {
		useStore
	} from "vuex";
	import {
		DraftStore,
		DraftType
	} from "../../store/draft";
	import { getBannerList } from "../../api/index";
	import {getTmpList} from "../../api/swapTemplate.js"
	import {
		onLoad,
		onShareAppMessage
	} from "@dcloudio/uni-app";
	import {
		useI18n
	} from "vue-i18n";

	const selectedTemplate = ref(null);
	const selectedGroup = ref({uuid:''});
	const store = useStore();
	const {
		t
	} = useI18n();

	const tagScrollVisbile = ref(false);
	const actionBarVisible = ref(true);
	const curPage = ref(0);
	const curTagScrollView = ref("");
	
	const tempTitle = computed(() =>store.state.tempTitleList);//ref([])
	const groupList = computed(() => store.state.tempTitleList[curPage.value]?.list||[]);//store.state.portrait);

	const bannerList = ref([])
	
	const indicatorDots = ref(true)
	const autoplay = ref(true)
	const interval = ref(2000)
	const duration = ref(500)
	
	const getBanner=()=>{
		console.log("请求banner")
		getBannerList().then(res=>{
			bannerList.value=res.data.items
		})
		getTmpList().then(res=>{
			let _tempTitle=[{title:'全部',uuid:''}].concat(res.data.items)
			store.commit('setTempTitleList',_tempTitle);
		})
	}
	const getListByUuid=async (category_uuid='',page=1)=>{
		debugger;
		await store.dispatch("fetchPortrait",{category_uuid,page});
	}
	const lower=(group)=>{
		getListByUuid(group.uuid,group.curPage+1)
	}

	onLoad(async () => {
		getBanner();
		await store.dispatch("fetchPortrait",{category_uuid:''});
		// tempTitle[0].list=store.state.portrait;
		// store.commit('setTempTitleList',tempTitle)
		const defaultSelected = groupList.value?.[0];
		selectedGroup.value = defaultSelected || [];
	});

	const onClickNextStep = () => {
		DraftStore.setTemplate(
			store,
			new DraftType.Template({
				id: selectedTemplate.value.uuid,
				name: selectedTemplate.value.title,
				target_image: selectedTemplate.value.cover,
			})
		);
		uni.navigateTo({
			url: "/pages/draw/confirm",
		});
	};

	const onSelectGroup = (group) => {
		selectedGroup.value = group;
		// const nextPage = groupList.value.findIndex(
		// 	(item) => item.id == selectedGroup.value?.id
		// );
		// curPage.value = nextPage;
		console.log('点击',group);
		store.commit('setTempUuid',group.uuid)
		store.dispatch("fetchPortrait",{category_uuid:group.uuid});
	};

	const onSelectTemplate = (template) => {
		selectedTemplate.value = template;
		onClickNextStep();
	};

	const handleSwiperChange = (current) => {
		const nextPage = current.detail.current;
		
		const groupId = tempTitle.value[nextPage].uuid;
		selectedGroup.value = tempTitle.value[nextPage];
		store.commit('setTempUuid',groupId);
		curPage.value = nextPage;
		getListByUuid(groupId);
		if (current.detail.source == "touch") {
			curTagScrollView.value = groupId;
		}
	};

	onShareAppMessage(() => {
		return {
			title: "Luna AI写真",
			path: "/pages/index/index",
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
		margin-top: -36rpx;padding:36rpx 40rpx 14px;
		border-radius: 36rpx;
		background-color: white;
		position: relative;
		z-index: 1;
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
		border-radius: 8px 8px;
		font-size: 14px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		color: #000;
		// background-color: #f4f4f4;
		gap: 2px;
		padding: 8px;

		.name {
			font-size: 14px;
			font-weight: 580;
			display: flex;
			justify-content: space-between;
			align-items: center;
			width: 100%;
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


	.swiper {
		height: 300rpx;
	}

	.swiper-item {
		display: block;
		height: 300rpx;
		line-height: 300rpx;
		text-align: center;
		color: white;
	}

	.uni-bg-blue {
		background-color: blue;
	}

	.uni-bg-green {
		background-color: green;
	}

	.uni-bg-red {
		background-color: red;
	}
	.name-btn{
		background-color: $mian-button-bg;
		color:white;
		border-radius: 16rpx;
		font-size: 12px;
		padding:10rpx 18rpx;
	}
</style>