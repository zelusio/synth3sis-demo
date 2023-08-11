// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {getWalletForEmail, mintNftToWallet} from "@/services/synth3sis.service";

type Data = {
  walletId: string
  walletAddress: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  const {email} = req.body

  // Get the wallet for the email
  const {walletAddress, walletId} = await getWalletForEmail(email)
  console.log(`wallet for email`, email, walletAddress, walletId)

  // mint the NFT to the email
  await mintNftToWallet(walletAddress)


  return res.json({walletAddress, walletId})

}
