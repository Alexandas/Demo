import {
	Token__factory,
	EcommerceNFT__factory,
	Token,
	EcommerceNFT
} from './types'
import { providers } from 'ethers'

class Contracts {

	private provider?: providers.Web3Provider
	public readonly EcommerceNFTAddr = '0xa19A7BCb7055D14C32F6942bD3f163c30b7Cb1ed'
	public readonly TokenAddr = '0xD0bbbB86948466655ef00CAD688079786706F753'

	public setProvider(provider: providers.Web3Provider) {
		this.provider = provider
	}

	public async sendTransaction(tx: { to: string, data: string }) {
		if (!this.provider) {
			throw new Error('provider not found')
		}
		const from = await this.signer.getAddress()
		const mytx = await this.signer.sendTransaction({
			from,
			...tx
		})
		return mytx.wait(1)
	}

	public get signer() {
		if (!this.provider) {
			throw new Error('provider not found')
		}
		return this.provider.getSigner()
	}

	public get Token(): Token {
		return Token__factory.connect(this.TokenAddr, this.signer)
	}

	public get EcommerceNFT(): EcommerceNFT {
		return EcommerceNFT__factory.connect(this.EcommerceNFTAddr, this.signer)
	}

}


const contracts = new Contracts()

export default contracts