import Image from 'next/image'

import ButtonCss from '../../components/customComponent/iconAndTextBtn.module.css'

const IconTextButton = (props: any) => {
  return (
    <div className={ButtonCss.btnContainer} role="button" tabIndex={0}>
      <Image src={props.Icon} alt="" width={32} height={32} aria-hidden="true" />
      <p className={ButtonCss.linkText}>{props.title}</p>
      <span className={ButtonCss.cornerDarkBtn} aria-hidden="true"></span>
    </div>
  )
}

export default IconTextButton
