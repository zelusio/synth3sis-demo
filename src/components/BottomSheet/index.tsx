import styles from './styles.module.scss'
import {useEffect, useState} from 'react'

export interface IBottomSheetProps {
    children?: JSX.Element | JSX.Element[] | string
    isOpen: boolean
}
export function BottomSheet({children, isOpen}: IBottomSheetProps) {

    const [isOpenState, setIsOpenState] = useState<boolean>(false)
    useEffect(() => {
        if (isOpen) setIsOpenState(true)

    })

    return (
        <div className={`${styles.bottomSheet} ${isOpenState ? styles.bottomSheet__onscreen : styles.bottomSheet__offscreen}`}>
            {children}
        </div>
    )
}

export default BottomSheet