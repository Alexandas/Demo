<template>
	<a-modal
		v-model="visible"
		style="width: 700px"
		:ok-button-props="{ style: { display: 'none' } }"
		:cancel-button-props="{ style: { display: 'none' } }"
		@cancel="close"
	>
		<a-form>
			<a-form-item label="GoodsCID">
				<a-input v-model="goodsCID" />
			</a-form-item>
			<a-form-item label="Price">
				<a-input v-model="price" />
			</a-form-item>
			<a-form-item label="Supply">
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
import { toToken } from '@/utils'

@Component
export default class AddGoods extends Vue {
	visible = false
	goodsCID = ''
	supply = '1'
	price = '1'

	@Prop()
	show = false

	@Watch('show')
	onShow(newValue: boolean) {
		this.visible = newValue
	}

	async confirm() {
		try {
			this.startLoading()
			if (!this.goodsCID) {
				throw 'Input goods cid first'
			}
			if (!this.price) {
				throw 'Input price first'
			}
			if (!this.supply) {
				throw 'Input supply first'
			}
			const data = contracts.EcommerceNFT.interface.encodeFunctionData(
				'addGoods',
				[
					this.formatCID(this.goodsCID),
					this.supply,
					toToken(this.price),
					Buffer.alloc(0),
				]
			)
			await contracts.sendTransaction({ to: contracts.EcommerceNFTAddr, data })
			this.close()
		} catch (e) {
			this.popError(e)
		} finally {
			this.endLoading()
		}
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
