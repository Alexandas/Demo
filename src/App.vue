<template>
	<div id="app">
		<div
			v-show="loading"
			id="spin"
		>
			<a-Spin style="margin-top: 25%; margin-left: 50%" />
		</div>
		<AddGoods
			:show="showAddGoodsModal"
			@close="onAddGoodsModalClose"
		/>
		<a-layout>
			<a-layout-header :style="{ position: 'fixed', zIndex: 1, width: '100%' }">
				<div>
					<span
						style="width: 100px; color: white; margin-right: 2rem"
						@click="goHome"
					>Home</span>
					<span
						v-show="isConnected"
						style="width: 100px; color: white"
					>{{ network }}:{{ account }}</span>
					<span
						v-show="!isConnected"
						style="width: 100px; color: white"
					><a-button
						type="primary"
						@click="connect"
					> Connect</a-button></span>
					<span
						v-show="isInitialized && !isMerchant"
						style="width: 100px; color: white; float: right"
					><a-button
						type="primary"
						@click="register"
					>Register</a-button></span>
					<span
						v-show="isInitialized && isMerchant"
						style="width: 100px; color: white; float: right"
					><a-button
						type="primary"
						@click="addGoods"
					>Add</a-button></span>
					<span
						v-show="isInitialized && isMerchant"
						style="color: white; float: right; margin-right: 1rem"
					>Balance: {{ balance
					}}<span style="font-size: 5px; margin-left: 1em">USDT</span></span>
				</div>
			</a-layout-header>
			<a-layout-content :style="{ padding: '0 50px', marginTop: '64px' }">
				<div
					:style="{ background: '#fff', padding: '24px', minHeight: '800px' }"
				>
					<keep-alive>
						<router-view style="margin-left: 8px" />
					</keep-alive>
				</div>
			</a-layout-content>
			<a-layout-footer :style="{ textAlign: 'center' }">
				EcommerceNFT
			</a-layout-footer>
		</a-layout>
	</div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { Core } from '@/web3modal/core'
import { UPDATE_ACCOUNT, UPDATE_CHAINID } from '@/store'
import { providers } from 'ethers'
import WalletconnectProvider from '@walletconnect/web3-provider'
import contracts from '@/contracts'
import AddGoods from '@/components/AddGoods.vue'
import { formatToken } from './utils'

@Component({
	components: { AddGoods },
})
export default class App extends Vue {
	core!: Core
	provider!: providers.Web3Provider
	// selectedKeys = ['1']
	isInitialized = false
	isMerchant = false
	balance = '-'
	showAddGoodsModal = false

	async created() {
		this.isInitialized = false
		this.core = new Core({
			providerOptions: {
				metamask: { package: '', display: { name: 'Metamask' } },
				walletconnect: {
					package: WalletconnectProvider,
					display: { name: 'WalletConnect' },
					options: { infuraId: 'f4c7dab173b4418ba4838ffadc3bd904' },
				},
			},
		})
		this.core.on('connect', async (p) => {
			this.provider = new providers.Web3Provider(p)
			contracts.setProvider(this.provider)
			const account = await contracts.signer.getAddress()
			const chainId = await contracts.signer.getChainId()
			this.$store.commit(UPDATE_ACCOUNT, account)
			this.$store.commit(UPDATE_CHAINID, chainId)
			this.isInitialized = true
			this.syncState()
		})
		this.core.on('close', (p) => {
			console.log('close', p)
			this.isInitialized = true
			this.syncState()
		})
		this.core.on('error', (p) => {
			console.log('error', p)
			this.isInitialized = true
			this.syncState()
		})
		await this.core.connect()
	}

	get network() {
		const chainId = this.$store.state.chainId
		if (chainId == 1) {
			return 'Ethereum Mainnet'
		} else if (chainId == 4) {
			return 'Rinkeby'
		} else if (chainId == 5) {
			return 'Goerli'
		} else {
			return 'Unknown'
		}
	}

	get isConnected() {
		return !!this.$store.state.account
	}

	get account() {
		return (
			this.$store.state.account.substr(0, 10) +
			'....' +
			this.$store.state.account.substr(this.$store.state.account.length - 8, 8)
		)
	}

	async syncState() {
		const account = this.$store.state.account
		this.getIsMerchant(account)
		this.getBalanceOf(account)
		setInterval(async () => {
			const account = this.$store.state.account
			if (account) {
				this.getIsMerchant(account)
				this.getBalanceOf(account)
			}
		}, 5000)
	}

	async getIsMerchant(account: string) {
		this.isMerchant = await contracts.EcommerceNFT.isMerchant(account)
	}

	async getBalanceOf(account: string) {
		const balance = await contracts.Token.balanceOf(account)
		this.balance = formatToken(balance)
	}

	async connect() {
		this.core.toggleModal()
	}

	async register() {
		try {
			this.startLoading()
			const data =
				contracts.EcommerceNFT.interface.encodeFunctionData('addMerchant')
			await contracts.sendTransaction({ to: contracts.EcommerceNFTAddr, data })
			await this.syncState()
		} catch (e) {
			this.popError(e)
		} finally {
			this.endLoading()
		}
	}

	goHome() {
		this.$router.push({
			path: '/',
		})
		this.$store.commit(UPDATE_ACCOUNT, this.$store.state.account)
	}

	addGoods() {
		this.showAddGoodsModal = true
	}

	onAddGoodsModalClose() {
		this.showAddGoodsModal = false
		window.location.reload()
	}

	get loading() {
		return this.$store.state.loading
	}
}
</script>
<style>
#spin {
	display: block;
	position: fixed;
	z-index: 999999;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	overflow: hidden;
	background-color: rgba(255, 255, 255, 0.6);
}

#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	color: #2c3e50;
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
}
#components-layout-demo-fixed .logo {
	width: 120px;
	height: 31px;
	background: rgba(255, 255, 255, 0.2);
	margin: 16px 24px 16px 0;
	float: left;
}
.site-layout .site-layout-background {
	background: #fff;
}

[data-theme='dark'] .site-layout .site-layout-background {
	background: #141414;
}
</style>
