import Image from 'next/image'

import ButtonCss from '../../components/customComponent/iconAndTextBtn.module.css'

const IconTextButton = (props: any) => {
  return (
    <div className={ButtonCss.btnContainer}>
      <Image src={props.Icon} alt={`icon ${props.title}`} width={32} height={32} />
      <p className={ButtonCss.linkText}>{props.title}</p>
      <span className={ButtonCss.cornerDarkBtn}></span>
    </div>
  )
}

export default IconTextButton
