import 'vue'

declare global {
	interface Goods {
		id?: string
		price?: string
		uri?: string
		merchant?: Merchant
		supply?: string
		txHash?: string
		timestamp?: string
	}

	interface Merchant {
		id?: string
		address?: string
		goodList?: Goods[]
		txHash?: string
		timestamp?: string
	}
}