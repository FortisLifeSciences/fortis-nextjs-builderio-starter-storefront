import txtbuttonCss from '@/components/customComponent/textButton.module.css'
const Button = (props: any) => (
  <div className={txtbuttonCss.btnContainer}>
    <span className={txtbuttonCss.btnText}>{props.textButton}</span>
    <span className={txtbuttonCss.btnArrow} aria-hidden="true"></span>
  </div>
)

export default Button
