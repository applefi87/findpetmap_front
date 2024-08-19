import { Notify } from 'quasar'
// import { useI18n } from 'vue-i18n'
// const { t } = useI18n()

export default (rep) => {
  let title = ''
  let text = ''
  let duration = 3000
  let position = 'center'
  let type = 'positive'

  if (typeof rep.message === 'object') {
    const message = rep.message
    title = message.title
    text = message.text
    duration = (message.duration || 3) * 1000
    position = message.position ? message.position : 'center'
    type = rep.success ? 'positive' : 'negative'
  } else if (typeof rep === 'object') {
    // 簡化版回復(message是文字)
    title = rep.message
    type = rep.success ? 'positive' : 'negative'
    duration = (rep.duration || 3) * 1000
  } else if (typeof rep === 'string') {
    title = rep
    type = 'negative'
  }

  return new Promise((resolve) => {
    Notify.create({
      message: title,
      caption: text,
      type,
      position,
      group: false,
      timeout: duration,
      // 改成這方法，可用await等通知消失才繼續下步驟(也許重載頁面)
      onDismiss: () => {
        resolve()
      }
    })
  })
}
