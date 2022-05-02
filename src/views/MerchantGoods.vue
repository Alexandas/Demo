<template>
	<div>
		<div
			v-show="goods.length == 0"
			style="
				text-align: center;
				margin-top: 25%;
				font-weight: bold;
				font-size: 28px;
			"
		>
			No Goods
		</div>
		<div class="Flex">
			<GoodsComponent
				v-for="good in goods"
				:key="good.id"
				style="margin: 1em 1em 1em 1em"
				:goods="good"
				@onClick="onGoodsSelected(good.id)"
			/>
		</div>
		<div
			v-show="showNext || showPrevious"
			class="PageButtons"
		>
			<a-button
				:disabled="!showPrevious"
				style="width: 100px"
				type="primary"
				@click="previous"
			>
				Previous
			</a-button>
			<a-button
				:disabled="!showNext"
				type="primary"
				style="width: 100px; margin-left: 1em"
				@click="next"
			>
				Next
			</a-button>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { UPDATE_ACCOUNT } from '@/store'

import API from '@/api/graphAPI'
import GoodsComponent from '@/components/GoodsComponent.vue'
@Component({
	components: {
		GoodsComponent,
	},
})
export default class MerchantGoods extends Vue {
	goods: any[] = []

	limit = 16
	offset = 0

	async onGoodsSelected(id: string) {
		console.log('onGoodsSelected', id)
		this.$router.push({
			path: `/goods/${id}`,
		})
	}

	async created() {
		this.$store.subscribe((mutations) => {
			if (mutations.type == UPDATE_ACCOUNT) {
				console.log('mutations', mutations)
				this.loadGoods()
			}
		})
	}

	async loadGoods() {
		const account = this.$store.state.account
		if (account) {
			const res = await API.getGoods(account, this.limit, this.offset)
			this.goods = res
		}
	}

	async previous() {
		try {
			this.startLoading()
			if (this.offset > this.limit) {
				this.offset -= this.limit
			} else {
				this.offset = 0
			}
			await this.loadGoods()
		} catch (e) {
			this.popError(e)
		} finally {
			this.endLoading()
		}
	}

	async next() {
		try {
			this.startLoading()
			this.offset += this.limit
			await this.loadGoods()
		} catch (e) {
			this.popError(e)
		} finally {
			this.endLoading()
		}
	}

	get showNext() {
		return this.goods.length == this.limit
	}

	get showPrevious() {
		return this.offset > 0
	}
}
</script>
<style>
.Flex {
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: flex-start;
	flex-wrap: wrap;
}

.PageButtons {
	margin-top: 3rem;
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: flex-start;
}
</style>
