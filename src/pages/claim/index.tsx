import Head from 'next/head'
import Image from 'next/image'
import {Inter, Space_Grotesk} from 'next/font/google'
import styles from './styles.module.scss'
import Link from "next/link";
import ellipse969 from "@/assets/img/ellipse-969.svg";

const spaceGrotesk = Space_Grotesk({subsets: ['latin']})

export function Claim({}) {

    return (
        <>
            <Head>
                <title>Claim your NFT Now </title>
                <meta name="description" content="Claim your NFT with an Email"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className={styles.main} style={spaceGrotesk.style}>
                <div className={styles.main}>
                    <div className={styles.gradientTop}></div>
                    <Image src={ellipse969} className={styles.ellipse969} alt={''}/>


                    <div className={styles.main__header}>
                        <p className={styles.main__header__text} style={spaceGrotesk.style}> CLAIM YOUR NFT NOW</p>

                    </div>


                </div>
            </main>
        </>
    )
}

export default Claim