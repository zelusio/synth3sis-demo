import styles from './styles.module.scss'
import {useEffect, useState} from "react";

export interface IModalProps {
    children?: JSX.Element | JSX.Element[] | string
    isOpen: boolean
}
export function Modal ({children, isOpen}: IModalProps) {

    const [isOpenState, setIsOpenState] = useState<boolean>(false)
    useEffect(() => {
        if (isOpen) setIsOpenState(true)
    }, [])

    return (
        <div className={`${styles.modal} ${isOpenState ? styles.modal__onscreen : styles.modal__offscreen}`}>
            {children}
        </div>
    )


}
export default Modal;