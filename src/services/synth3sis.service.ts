import axios, {AxiosInstance} from 'axios';
import {remoteSecrets} from './secrets.service'

// Once remote Secrets are loaded from AWSSM, create an axios instance with the Base URL and API key.
// (this part is optional - you can use a .env file instead of a remote secrets manager)
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
 * Get wallet address & wallet ID for email - if a wallet already exists for the email, it is retrieved.
 *  If not, a new wallet is created & its' information is retrieved.
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

/**
 * Mint an NFT to a wallet on a contract that has been deployed and configured in the Synth3sis service
 * @param walletAddress - the wallet address to mint to
 */
export async function mintNftToWallet(walletAddress: string): Promise<any> {
    const response = await (await axiosInstance).post(`/v1/nft/mint`, {
        walletAddress,
        contractId: 'contract_311d7ee0-4afa-4ada-87b9-dcdb1644d38d',
        nftTokenId: '2'
    })
    console.log(`Synthesis service: minting queued`)
    return
}