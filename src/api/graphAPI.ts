import axios, { AxiosStatic } from 'axios'

export class GraphAPI {

	public axios: AxiosStatic
	public readonly url: string = 'https://api.thegraph.com/subgraphs/name/alexandas/ecommercenft'
	constructor() {
		this.axios = axios
	}

	public async getGoodsDetail(id: string): Promise<Model.Goods[]> {
		const res = await this.axios({
			url: this.url,
			method: 'POST',
			data: {
				query: `{
					goods(where: { id: "${id}"}) {
						id
						price
						uri
						supply
						timestamp
						txHash
						merchant {
							id
							address
							txHash
							timestamp
						}
					}
				  }`
			}
		})
		return res.data.data.goods
	}

	public async getGoods(
		merchant: string,
		limit: number,
		offset = 10
	): Promise<Model.Goods[]> {
		const res = await this.axios({
			url: this.url,
			method: 'POST',
			data: {
				query: `{
					goods(first: ${limit} skip: ${offset} where: { merchant: "${merchant.toLowerCase()}"} orderBy: timestamp orderDirection: desc) {
						id
						price
						uri
						supply
						timestamp
						txHash
						merchant {
							id
							address
							txHash
							timestamp
						}
					}
				  }`
			}
		})
		return res.data.data.goods
	}
}

export default new GraphAPI()