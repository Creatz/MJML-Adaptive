import { HeadComponent } from 'mjml-core'

export default class MjHead extends HeadComponent {
  static componentName = 'mj-head'

  static allowedAttributes = {
    amp: 'string',
  }

  handler() {
    return this.handlerChildren()
  }
}
