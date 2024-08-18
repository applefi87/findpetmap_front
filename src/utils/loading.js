import { Loading, QSpinnerGears } from 'quasar'

// fully customizable
export default (inp) => {
  Loading.show({
    spinner: QSpinnerGears,
    message: inp.title,
    // other props
    delay: inp.delay ? inp.delay : 400
  })
  return Loading
}
