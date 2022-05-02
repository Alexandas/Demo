<template>
	<div>
		<div
			v-if="canEdit"
			class="Flex-Row-End"
		>
			<a-button
				type="primary"
				@click="edit"
			>
				Edit
			</a-button>
		</div>
		<div class="Flex-Row">
			<img
				:src="src"
				style="width: 400px; height: 400px"
			>
			<div class="Flex-Column">
				<div style="font-weight: bold; font-size: 3em">
					{{ name }}
				</div>
				<div style="margin-top: 8px">
					<span class="Label">Price:</span>
					<span style="font-size: 2rem; font-weight: bold; margin-right: 2px">{{
						price
					}}</span>
					<span style="font-size: 1rem">USDT</span>
				</div>
				<div style="margin-top: 8px">
					<span class="Label">Supply:</span>{{ supply }}
				</div>

				<div style="margin-top: 8px">
					<span class="Label">Description: </span>{{ description }}
				</div>
			</div>
		</div>
		<EditGoods
			:goods="goods"
			:show="showEdit"
			@close="onCloseEdit"
		/>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator'
import { formatToken } from '@/utils'
import { BigNumber } from 'ethers'
import { UPDATE_ACCOUNT } from '@/store'
import ipfsAPI from '@/api/ipfsAPI'
import graphAPI from '@/api/graphAPI'
import png from '@/assets/default.png'
import contracts from '@/contracts'
import EditGoods from '@/components/EditGoods.vue'

@Component({
	components: { EditGoods },
})
export default class GoodsDetail extends Vue {
	goods: Goods = {}

	src = png
	name = ''
	description = '-'
	canEdit = false

	showEdit = false
	@Watch('$route.params')
	async onParamsChanged(params: any) {
		if (params.id) {
			this.startLoading()
			await this.load()
			this.endLoading()
		}
	}

	async mounted() {
		this.startLoading()
		await this.load()
		this.endLoading()
		this.$store.subscribe((mutations) => {
			if (mutations.type == UPDATE_ACCOUNT) {
				console.log('mutations', mutations)
				this.syncState()
			}
		})
	}

	async load() {
		try {
			if (!this.$route.params.id) {
				return
			}
			const list = await graphAPI.getGoodsDetail(this.$route.params.id)
			if (list.length > 0) {
				this.goods = list[0]
				const result = await ipfsAPI.getGoodMeta(this.goods.uri!)
				this.src = ipfsAPI.formatUri(result.image)
				this.name = result.name
				this.description = result.description
				this.syncState()
			}
		} catch (e) {
			console.log(e)
		}
	}

	async syncState() {
		if (this.$route.params.id) {
			const merchant = await contracts.EcommerceNFT.goodsMerchants(
				this.$route.params.id
			)
			console.log(merchant, this.$store.state.account)
			this.canEdit = merchant == this.$store.state.account
		}
	}

	edit() {
		this.showEdit = true
	}

	onCloseEdit() {
		this.showEdit = false
		this.load()
	}

	get supply() {
		return this.goods?.supply ?? '-'
	}

	get price() {
		if (this.goods.price) {
			console.log('price', this.goods.price)
			return formatToken(BigNumber.from(this.goods.price))
		}
		return '-'
	}
}
</script>
<style>
.Flex-Row-End {
	display: flex;
	justify-content: flex-end;
	align-items: flex-start;
}
.Flex-Row {
	display: flex;
	justify-content: center;
	align-items: flex-start;
}
.Flex-Column {
	margin-left: 1rem;
	height: 400px;
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	align-items: flex-start;
}
.Label {
	font-size: 1.2rem;
	font-weight: bold;
	margin-right: 2px;
	color: #666666;
}
</style>
