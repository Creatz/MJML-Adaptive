// eslint-disable-next-line max-classes-per-file
import {
  get,
  forEach,
  identity,
  reduce,
  kebabCase,
  find,
  filter,
  isNil,
  omitBy,
} from 'lodash'

import MJMLParser from 'mjml-parser-xml'

import shorthandParser, { borderParser } from './helpers/shorthandParser'
import formatAttributes from './helpers/formatAttributes'
import jsonToXML from './helpers/jsonToXML'

const VARIANT_TAG = 'variant'
const VARIANT_DEVICES = new Set(['desktop', 'mobile'])
const VARIANT_STYLE_ID = 'mj-variant'
const VARIANT_STYLE_ATTRS = ['variant-style-desktop', 'variant-style-mobile']

const ensureVariantStyles = (context) => {
  if (!context || !context.addHeadStyle) return

  context.addHeadStyle(VARIANT_STYLE_ID, (breakpoint) => `
    .mj-variant-desktop { display:block !important; }
    .mj-variant-mobile { display:none !important; mso-hide:all; max-height:0; overflow:hidden; }
    @media only screen and (max-width:${breakpoint}) {
      .mj-variant-desktop { display:none !important; max-height:0 !important; overflow:hidden !important; }
      .mj-variant-mobile { display:block !important; max-height:none !important; overflow:visible !important; }
    }
  `)
}

const getVariantAttributeOverrides = (variant) =>
  omitBy(variant.attributes || {}, (_v, key) => key === 'device')

const appendCssClass = (value, extra) =>
  value ? `${value} ${extra}` : extra

const normalizeCssDeclarations = (value) => {
  if (!value) return ''

  return value
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (part.includes(':') ? part : `${part}:`))
    .map((part) =>
      part.endsWith('!important') ? part : `${part} !important`,
    )
    .map((part) => (part.endsWith(';') ? part : `${part};`))
    .join(' ')
}

export function initComponent({ initialDatas, name }) {
  const Component = initialDatas.context.components[name]

  if (Component) {
    const component = new Component(initialDatas)

    if (component.headStyle) {
      component.context.addHeadStyle(name, component.headStyle)
    }
    if (component.componentHeadStyle) {
      component.context.addComponentHeadSyle(component.componentHeadStyle)
    }

    return component
  }

  return null
}

class Component {
  static getTagName() {
    return this.componentName || kebabCase(this.name)
  }

  static isRawElement() {
    return !!this.rawElement
  }

  static defaultAttributes = {}

  constructor(initialDatas = {}) {
    const {
      attributes = {},
      children = [],
      content = '',
      context = {},
      props = {},
      globalAttributes = {},
      absoluteFilePath = null,
      rawAttrs = {},
    } = initialDatas

    this.props = {
      absoluteFilePath,
      ...props,
      children,
      content,
      rawAttrs,
    }

    this.attributes = formatAttributes(
      {
        ...this.constructor.defaultAttributes,
        ...globalAttributes,
        ...attributes,
      },
      this.constructor.allowedAttributes,
    )
    this.context = context

    const variantStyleDesktop = this.attributes['variant-style-desktop']
    const variantStyleMobile = this.attributes['variant-style-mobile']

    if (
      (variantStyleDesktop || variantStyleMobile) &&
      this.context &&
      this.context.addHeadStyle &&
      this.context.globalData
    ) {
      const classId =
        (this.context.globalData.variantStyleCounter += 1) // eslint-disable-line no-plusplus
      const className = `mj-variant-style-${classId}`

      const desktopCss = normalizeCssDeclarations(variantStyleDesktop)
      const mobileCss = normalizeCssDeclarations(variantStyleMobile)

      this.context.addHeadStyle(`${VARIANT_STYLE_ID}-${classId}`, (breakpoint) =>
        [
          desktopCss ? `.${className} { ${desktopCss} }` : '',
          mobileCss
            ? `@media only screen and (max-width:${breakpoint}) { .${className} { ${mobileCss} } }`
            : '',
        ]
          .filter(Boolean)
          .join('\n'),
      )

      const mergedCssClass = appendCssClass(
        this.attributes['css-class'],
        className,
      )

      this.attributes['css-class'] = mergedCssClass
      this.props.rawAttrs = {
        ...this.props.rawAttrs,
        'css-class': mergedCssClass,
      }
    }

    return this
  }

  getChildContext() {
    return this.context
  }

  getAttribute(name) {
    return this.attributes[name]
  }

  getContent() {
    return this.props.content.trim()
  }

  renderMJML(mjml, options = {}) {
    if (typeof mjml === 'string') {
      // supports returning siblings elements from a custom component
      const partialMjml = MJMLParser(`<fragment>${mjml}</fragment>`, {
        ...options,
        components: this.context.components,
        ignoreIncludes: true,
      })
      return partialMjml.children
        .map((child) => this.context.processing(child, this.context))
        .join('')
    }

    return this.context.processing(mjml, this.context)
  }
}

export class BodyComponent extends Component {
  // eslint-disable-next-line class-methods-use-this
  getStyles() {
    return {}
  }

  getShorthandAttrValue(attribute, direction) {
    const mjAttributeDirection = this.getAttribute(`${attribute}-${direction}`)
    const mjAttribute = this.getAttribute(attribute)

    if (mjAttributeDirection) {
      return parseInt(mjAttributeDirection, 10)
    }

    if (!mjAttribute) {
      return 0
    }

    return shorthandParser(mjAttribute, direction)
  }

  getShorthandBorderValue(direction, attribute = 'border') {
    const borderDirection =
      direction && this.getAttribute(`${attribute}-${direction}`)
    const border = this.getAttribute(attribute)

    return borderParser(borderDirection || border || '0')
  }

  getBoxWidths() {
    const { containerWidth } = this.context
    const parsedWidth = parseInt(containerWidth, 10)

    const paddings =
      this.getShorthandAttrValue('padding', 'right') +
      this.getShorthandAttrValue('padding', 'left')

    const borders =
      this.getShorthandBorderValue('right') +
      this.getShorthandBorderValue('left')

    return {
      totalWidth: parsedWidth,
      borders,
      paddings,
      box: parsedWidth - paddings - borders,
    }
  }

  htmlAttributes(attributes) {
    const specialAttributes = {
      style: (v) => this.styles(v),
      default: identity,
    }

    const cssClass = this.getAttribute && this.getAttribute('css-class')
    if (cssClass && attributes && attributes.class) {
      const classList = new Set(
        attributes.class
          .split(' ')
          .map((c) => c.trim())
          .filter(Boolean),
      )
      cssClass
        .split(' ')
        .map((c) => c.trim())
        .filter(Boolean)
        .forEach((c) => classList.add(c))
      // eslint-disable-next-line no-param-reassign
      attributes = { ...attributes, class: Array.from(classList).join(' ') }
    }

    return reduce(
      omitBy(attributes, isNil),
      (output, v, name) => {
        const value = (specialAttributes[name] || specialAttributes.default)(v)

        return `${output} ${name}="${value}"`
      },
      '',
    )
  }

  styles(styles) {
    let stylesObject

    if (styles) {
      if (typeof styles === 'string') {
        stylesObject = get(this.getStyles(), styles)
      } else {
        stylesObject = styles
      }
    }

    return reduce(
      stylesObject,
      (output, value, name) => {
        if (!isNil(value)) {
          return `${output}${name}:${value};`
        }
        return output
      },
      '',
    )
  }

  renderChildren(children, options = {}) {
    const {
      props = {},
      renderer = (component) => component.render(),
      attributes = {},
      rawXML = false,
    } = options

    children = children || this.props.children

    if (rawXML) {
      return children
        .map((child) => {
          child.attributes = { ...attributes, ...child.attributes }
          return jsonToXML(child)
        })
        .join('\n')
    }

    const sibling = children.length

    const rawComponents = filter(this.context.components, (c) =>
      c.isRawElement(),
    )
    const nonRawSiblings = children.filter(
      (child) => !find(rawComponents, (c) => c.getTagName() === child.tagName),
    ).length

    let output = ''
    let index = 0

    forEach(children, (child) => {
      if (child.tagName === VARIANT_TAG) {
        const device = get(child, 'attributes.device')

        if (!VARIANT_DEVICES.has(device)) {
          index++ // eslint-disable-line no-plusplus
          return
        }

        ensureVariantStyles(this.context)

        const variantOverrides = getVariantAttributeOverrides(child)
        const innerChildren = child.children || []

        const rendered = innerChildren
          .map((innerChild) => {
            const variantOverridesRaw = getVariantAttributeOverrides(child)
            const variantCssClass = `mj-variant mj-variant-${device}`
            const mergedCssClass = appendCssClass(
              innerChild.attributes && innerChild.attributes['css-class'],
              variantCssClass,
            )

            const component = initComponent({
              name: innerChild.tagName,
              initialDatas: {
                ...innerChild,
                attributes: {
                  ...attributes,
                  ...innerChild.attributes,
                  ...variantOverrides,
                  'css-class': mergedCssClass,
                },
                rawAttrs: {
                  ...(innerChild.rawAttrs || {}),
                  ...variantOverridesRaw,
                  'css-class': mergedCssClass,
                },
                context: this.getChildContext(),
                props: {
                  ...props,
                  first: index === 0,
                  index,
                  last: index + 1 === sibling,
                  sibling,
                  nonRawSiblings,
                },
              },
            })

            if (component !== null) {
              return renderer(component)
            }

            return ''
          })
          .join('')

        if (rendered) {
          output +=
            device === 'mobile'
              ? `<!--[if !mso]><!-->${rendered}<!--<![endif]-->`
              : rendered
        }
        index++ // eslint-disable-line no-plusplus
        return
      }

      const component = initComponent({
        name: child.tagName,
        initialDatas: {
          ...child,
          attributes: {
            ...attributes,
            ...child.attributes,
          },
          context: this.getChildContext(),
          props: {
            ...props,
            first: index === 0,
            index,
            last: index + 1 === sibling,
            sibling,
            nonRawSiblings,
          },
        },
      })

      if (component !== null) {
        output += renderer(component)
      }

      index++ // eslint-disable-line no-plusplus
    })

    return output
  }
}

export class HeadComponent extends Component {
  static getTagName() {
    return this.componentName || kebabCase(this.name)
  }

  handlerChildren() {
    const { children } = this.props

    return children.map((children) => {
      const component = initComponent({
        name: children.tagName,
        initialDatas: {
          ...children,
          context: this.getChildContext(),
        },
      })

      if (!component) {
        // eslint-disable-next-line no-console
        console.error(`No matching component for tag : ${children.tagName}`)
        return null
      }

      if (component.handler) {
        component.handler()
      }

      if (component.render) {
        return component.render()
      }
      return null
    })
  }
}
