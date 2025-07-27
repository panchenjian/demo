<template>
	<view class="l-liquid" :class="{'l-liquid--outline': outline}"  :style="[styles]">
		<view class="l-liquid__inner" :style="[innerStyle]">
			<view class="l-liquid__waves" :style="[wavesStyle]">
				<view class="wave" :style="[waveStyle]"></view>
				<view class="wave two" :style="[waveStyle]"></view>
			</view>
		</view>
		<view class="l-liquid__value">
			<slot></slot>
		</view>
	</view>
</template>
<script lang="ts">
	// @ts-nocheck
	import {computed, ref, watch, onUnmounted, defineComponent} from '@/uni_modules/lime-shared/vue';
	import { useTransition, UseTransitionOptions } from "@/uni_modules/lime-shared/animation/useTransition";
	
	import liquidProps from './props';
	// import {useTransition} from '@/uni_modules/lime-use';
	const name = 'l-liquid'
	export default defineComponent({
		name,
		props: liquidProps,
		emits: ['update:current'],
		setup(props, {emit}) {
			const percent = ref(0)
			// const current = ref(props.percent)
			const current = useTransition(percent, {duration: 300})
			// const classes = computed(() => ({
			// 	[name + '--outline']: props.outline
			// }))
			const styles = computed(() => {
				return {
					width: props.size,
					height: props.size,
					'border-radius': props.radius
				}
			})
			const innerStyle = computed(() => {
				return {
					'border-radius': props.radius,
					'background': props.innerColor
				}
			})
			const wavesStyle = computed(() => {
				return {
					'--l-liquid-percent':  current.value * -1 + '%'
				}
			})
			const waveStyle = computed(() => {
				return {
					background: props.waveColor
				}
			})
			// let timer = null
			// const stopPercent = watch(() => props.percent, (v) => {
			// 	percent.value = v
			// 	clearTimeout(timer)
			// 	const step = () => {
			// 		if(v == current.value) {
			// 			clearTimeout(timer)
			// 			emit('update:current', current.value)
			// 			return 
			// 		}
			// 		const value = (v - current.value)
			// 		if(value > 0) {
			// 			current.value += 1
			// 		}
			// 		if(value < 0){
			// 			 current.value -= 1
			// 		}
			// 		emit('update:current', current.value)
			// 		timer = setTimeout(step, 1000 / 60)
			// 	}
			// 	timer = setTimeout(step, 1000 / 60)
			// }, {immediate: true})
			
			const stopCurrent = watch(current, (v) => {
				emit('update:current', Math.round(v))
			})
			const stopPercent = watch(() => props.percent, (v) => {
				percent.value = v
			}, {immediate: true})
			
			onUnmounted(() => {
				stopCurrent && stopCurrent()
				stopPercent && stopPercent()
			})
			
			return {
				// classes,
				styles,
				innerStyle,
				wavesStyle,
				waveStyle
			}
		}
	})
	
</script>
<style lang="scss">
	// @import './index';
	@import './index-u';
</style>
