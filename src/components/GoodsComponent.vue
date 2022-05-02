<template>
	<div @click="onClick">
		<img
			style="width: 350px; height: 350px"
			:src="src"
		>
		<div style="font-weight: bold; font-size: 1.5em">
			{{ name }}
		</div>
		<div style="margin-top: 8px">
			<span
				style="
					font-size: 0.8em;
					font-weight: bold;
					margin-right: 2px;
					color: #666666;
				"
			>Price:</span>
			<span style="font-size: 1.5em; font-weight: bold; margin-right: 2px">{{
				formatPrice
			}}</span>
			<span style="font-size: 0.5em">USDT</span>
		</div>
		<div style="margin-top: 8px">
			<span
				style="
					font-size: 0.8em;
					font-weight: bold;
					margin-right: 2px;
					color: #666666;
				"
			>Supply:</span>{{ goods.supply }}
		</div>

		<div style="margin-top: 8px">
			<span
				style="
					font-size: 0.8em;
					font-weight: bold;
					margin-right: 2px;
					color: #666666;
				"
			>Description: </span>{{ description }}
		</div>
	</div>
</template>

<script lang="ts">
import ipfsAPI from '@/api/ipfsAPI'
import { Component, Vue, Prop, Emit } from 'vue-property-decorator'
import { formatToken } from '@/utils'
import { BigNumber } from '@ethersproject/bignumber'
import png from '@/assets/default.png'

@Component
export default class GoodsComponent extends Vue {
	@Prop() goods!: Goods

	src = png
	name = ''
	description = ''

	@Emit('onClick')
	async onClick() {
		this.$emit('onClick', this.goods.id)
	}

	async mounted() {
		const result = await ipfsAPI.getGoodMeta(this.goods.uri!)
		this.src = ipfsAPI.formatUri(result.image)
		this.name = result.name
		this.description = result.description
	}

	get formatPrice() {
		return formatToken(BigNumber.from(this.goods.price))
	}
}
</script>
