import Head from 'next/head'
import Image from 'next/image'
import {Inter, Space_Grotesk} from 'next/font/google'
import styles from './styles.module.scss'

import ellipse970 from '@/assets/img/Ellipse 970.svg'
import ellipse971 from '@/assets/img/ellipse-971.svg'
import ellipse972 from '@/assets/img/ellipse-972.svg'
import ellipse969 from '@/assets/img/ellipse-969.svg'
import star5 from '@/assets/img/star-5.svg'
import rightArrow from '@/assets/img/right-arrow.svg'
import Link from "next/link";


const spaceGrotesk = Space_Grotesk({subsets: ['latin']})

export default function Home() {
    return (
        <>
            <Head>
                <title>Claim Your NFT Now</title>
                <meta name="description" content="Claim your NFT with an Email"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <main className={`${styles.main} ${spaceGrotesk.className}`}>
                <div className={styles.main}>
                    <Image src={ellipse970} className={styles.ellipse970} alt={''}/>
                    <Image src={ellipse971} className={styles.ellipse971} alt={''}/>
                    <Image src={ellipse972} className={styles.ellipse972} alt={''}/>
                    <Image src={ellipse969} className={styles.ellipse969} alt={''}/>
                    <Image src={star5} className={styles.star5} alt={''}/>

                    <div className={styles.heroContent}>
                        <div className={styles.gradientTop}></div>
                        <p className={styles.heroContent__title} style={spaceGrotesk.style}> CLAIM YOUR NFT NOW</p>
                        <p className={styles.heroContent__subtitle} style={spaceGrotesk.style}>Use the button below to
                            claim your NFT using your email address -- no wallet needed!</p>

                        <Link href={'/claim'}>
                        <div className={styles.heroContent__button}>
                            <div className={styles.heroContent__button__text} style={spaceGrotesk.style}>Claim Now</div>
                            <Image src={rightArrow} alt={''} className={styles.heroContent__button__arrow}/>
                        </div>
                        </Link>
                    </div>
                </div>

            </main>
        </>
    )
}
