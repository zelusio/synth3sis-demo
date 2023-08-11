import axios, {Axios, AxiosInstance} from 'axios';
import {remoteSecrets} from './secrets.service'

const axiosInstance = new Promise<AxiosInstance>(async (resolve) => {

    const {SYNTH3SIS_API_KEY, SYNTH3SIS_API_URL} = await remoteSecrets()
    resolve(axios.create({
        baseURL: SYNTH3SIS_API_URL,
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': SYNTH3SIS_API_KEY
        }
    }))

});

/**
 * Get wallet address & wallet ID for email
 * @param email - the email to get a wallet for
 * @returns {Promise<{walletId: string, walletAddress: string}>} - the wallet ID and wallet address
 */
export async function getWalletForEmail(email: string): Promise<{ walletId: string, walletAddress: string }> {
    const response = await (await axiosInstance).post(`/v1/wallet/create`, {
        ignoreAddress: false,
        email
    })
    console.log(`Synthesis service:`, response.status, response.statusText, response.data)
    const {walletId, walletAddress} = response.data.result
    return {walletId, walletAddress}

}

export async function mintNftToWallet(walletAddress: string): Promise<any> {
    const response = await (await axiosInstance).post(`/v1/nft/mint`, {
        walletAddress,
        contractId: 'contract_311d7ee0-4afa-4ada-87b9-dcdb1644d38d',
        nftTokenId: '2'
    })
    console.log(`Synthesis service: minting queued`)
    return
}