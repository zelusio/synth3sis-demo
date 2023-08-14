import Head from 'next/head'
import Image from 'next/image'
import {Inter, Space_Grotesk} from 'next/font/google'
import styles from './styles.module.scss'
import Link from "next/link";
import ellipse969 from "@/assets/img/ellipse-969.svg";
import smooth1 from '@/assets/img/smooth-1.png'
import rightArrow from "@/assets/img/right-arrow.svg";
import flag from '@/assets/img/Icon/Feedback Flag.svg'
import matic from '@/assets/img/Icon/Matic.svg'
import wallet from '@/assets/img/Icon/Wallet.svg'
import {useState, useEffect} from "react";
import axios from "axios";
import UAParser from 'ua-parser-js'
import BottomSheet from "@/components/BottomSheet";

const spaceGrotesk = Space_Grotesk({subsets: ['latin']})

export interface IClaimProps {
    userAgent: string
}

// @ts-ignore
export async function getServerSideProps({req}) {
    const userAgent = req.headers['user-agent']
    return {
        props: {
            userAgent
        }
    }
}

export function Claim({userAgent}: IClaimProps) {

    const [email, setEmail] = useState<string>('')
    const [showPostClaim, setShowPostClaim] = useState<boolean>(false)
    const [walletAddress, setWalletAddress] = useState<string>('')


    // Wait for window to load
    const parser = new UAParser(userAgent)
    const isMobile = parser.getDevice().type === 'mobile'



    const claimNft = async () => {
        const response = await axios.post('/api/mint', {email})
        const {walletId, walletAddress} = response.data
        console.log(`got wallet data`, walletId, walletAddress)
        //alert(`NFT claimed to wallet ${walletAddress} for email ${email} - https://polygonscan.com/address/${walletAddress}#tokentxnsErc1155`)
        setShowPostClaim(true)
        setWalletAddress(walletAddress)

        console.log(`windows opened`)
    }

    return (
        <>
            <Head>
                <title>Claim your NFT Now </title>
                <meta name="description" content="Claim your NFT with an Email"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className={styles.main} style={spaceGrotesk.style}>
                <div className={`${styles.main} ${showPostClaim ? styles.mainContentBlurred : ''}`}>
                    <div className={styles.gradientTop}></div>
                    <Image src={ellipse969} className={styles.ellipse969} alt={''}/>


                    <div className={styles.main__header}>
                        <p className={styles.main__header__text} style={spaceGrotesk.style}> Claim your NFT Now</p>
                    </div>

                    <Image src={smooth1} alt={''} className={styles.main__image}/>

                    <div className={styles.claimGroup}>
                        <input
                            type={'email'}
                            placeholder={'Enter your email address'}
                            className={styles.claimGroup__input}
                            style={spaceGrotesk.style}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <div className={styles.claimGroup__button} onClick={claimNft}>
                            <div className={styles.claimGroup__button__text} style={spaceGrotesk.style}>Claim Now</div>
                            <Image src={flag} alt={''} className={styles.claimGroup__button__icon}/>
                        </div>
                    </div>


                </div>
            </main>

            {showPostClaim &&
                <BottomSheet isOpen={showPostClaim && isMobile}>
                    <>
                        {/*Title*/}
                        <span style={spaceGrotesk.style} className={styles.nftMintedTitle}>NFT Minted!</span>
                        <span style={spaceGrotesk.style} className={styles.nftMintedSubtitle}>It may may take a second for your NFT to mint. Use one of the links below to view it. </span>


                        {/*TODO use the address to poll the chain and wait for incoming txs*/}

                        <div className={styles.claimGroup__button} onClick={() => {
                            const newTab = window.open(`https://polygonscan.com/address/${walletAddress}#tokentxnsErc1155`, '_blank')
                            newTab?.focus()
                        }}>
                            <div className={styles.claimGroup__button__text} style={spaceGrotesk.style}>View on Polygonscan</div>
                            <Image src={matic} alt={''} className={styles.claimGroup__button__icon}/>
                        </div>

                        <div className={styles.claimGroup__button} onClick={() => {
                            const newTab = window.open(`https://gallery.zelus.io/nfts/${walletAddress}`, '_blank')
                            newTab?.focus()
                        }}>
                            <div className={styles.claimGroup__button__text} style={spaceGrotesk.style}>View in Wallet</div>
                            <Image src={wallet} alt={''} className={styles.claimGroup__button__icon}/>
                        </div>
                    </>
                </BottomSheet>
            }
        </>
    )
}

export default Claim