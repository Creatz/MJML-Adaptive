import ruleError from './ruleError'

export default function variantPlacement(element, { components }) {
  if (!element || element.tagName !== 'variant') {
    return null
  }

  const errors = []

  if (element.content && element.content.trim()) {
    errors.push(
      ruleError(
        '<variant> cannot have direct text content. Wrap a MJML component.',
        element,
      ),
    )
  }

  const children = element.children || []

  if (children.length !== 1 || !children[0] || !children[0].tagName) {
    errors.push(
      ruleError(
        '<variant> must wrap exactly one MJML component.',
        element,
      ),
    )
  } else if (children[0].tagName === 'variant') {
    errors.push(
      ruleError(
        '<variant> cannot contain another <variant>.',
        element,
      ),
    )
  }

  return errors
}
