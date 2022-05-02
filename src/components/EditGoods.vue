<template>
	<a-modal
		v-model="visible"
		style="width: 700px"
		:ok-button-props="{ style: { display: 'none' } }"
		:cancel-button-props="{ style: { display: 'none' } }"
		@cancel="close"
	>
		<a-form>
			<a-form-item label="GoodsURI">
				<a-input v-model="uri" />
			</a-form-item>
			<a-form-item label="Price">
				<a-input v-model="price" />
			</a-form-item>
			<a-form-item :label="supplyLabel">
				<a-input v-model="supply" />
			</a-form-item>
			<a-form-item>
				<a-button
					type="primary"
					html-type="submit"
					@click="confirm"
				>
					Confirm
				</a-button>
			</a-form-item>
		</a-form>
	</a-modal>
</template>

<script lang="ts">
import contracts from '@/contracts'
import { Component, Vue, Prop, Emit, Watch } from 'vue-property-decorator'
import { toToken, formatToken } from '@/utils'
import { BigNumber } from '@ethersproject/bignumber'

@Component
export default class EditGoods extends Vue {
	@Prop()
	goods!: Goods

	visible = false
	uri = ''
	supply = '0'
	price = '0'
	currentSupply = '0'

	@Prop()
	show = false

	@Watch('show')
	onShow(newValue: boolean) {
		this.visible = newValue
	}

	@Watch('goods')
	onGoodsChanged(goods?: Goods) {
		if (goods) {
			console.log('goods', goods)
			this.uri = goods.uri!
			this.currentSupply = goods.supply!
			this.price = formatToken(BigNumber.from(goods.price!))
		}
	}

	async confirm() {
		try {
			this.startLoading()
			if (!this.uri) {
				throw 'Input goods uri first'
			}
			if (!this.price) {
				throw 'Input price first'
			}
			if (!this.supply) {
				this.supply = '0'
			}
			// 	uint256 id,
			// uint256 amount,
			// uint256 price,
			// string memory uri,
			// bytes memory data
			const data = contracts.EcommerceNFT.interface.encodeFunctionData('edit', [
				this.goods.id!,
				this.supply,
				toToken(this.price),
				this.formatCID(this.uri),
				Buffer.alloc(0),
			])
			await contracts.sendTransaction({ to: contracts.EcommerceNFTAddr, data })
			this.close()
		} catch (e) {
			this.popError(e)
		} finally {
			this.endLoading()
		}
	}

	get supplyLabel() {
		return `AddSupply(${this.currentSupply}):`
	}

	formatCID(cid: string) {
		if (cid.startsWith('ipfs://')) {
			return cid
		}
		return `ipfs://${cid}`
	}

	@Emit()
	close() {}
}
</script>
