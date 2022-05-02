import axios, { AxiosStatic } from 'axios'
interface GoodMeta {
	name: string
	image: string
	description: string
}

export class IPFSAPI {

	public axios: AxiosStatic
	// ipfs public gateway
	public readonly url: string = 'https://mygateway.mypinata.cloud/ipfs/'

	constructor() {
		this.axios = axios
	}

	public formatUri(uri: string): string {
		if (uri.startsWith('ipfs://')) {
			uri = uri.substring(7)
		}
		return `${this.url}${uri}`
	}

	public async getGoodMeta(uri: string): Promise<GoodMeta> {
		const res = await this.axios({
			url: this.formatUri(uri),
			method: 'GET'
		})
		return res.data
	}
}

export default new IPFSAPI()