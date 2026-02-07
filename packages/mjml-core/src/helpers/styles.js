import { isFunction } from 'lodash'

export function buildStyleFromComponents(
  breakpoint,
  componentsHeadStyles,
  headStylesObject,
) {
  const headStyles = Object.values(headStylesObject)

  if (componentsHeadStyles.length === 0 && headStyles.length === 0) {
    return ''
  }

  const minifyCss = (css) =>
    css
      .replace(/\s+/g, ' ')
      .replace(/\s*([:;{},])\s*/g, '$1')
      .replace(/;\}/g, '}')
      .trim()

  return `
    <style type="text/css">${minifyCss(
      [...componentsHeadStyles, ...headStyles].reduce(
        (result, styleFunction) => `${result}\n${styleFunction(breakpoint)}`,
        '',
      ),
    )}</style>`
}

export function buildStyleFromTags(breakpoint, styles) {
  if (styles.length === 0) {
    return ''
  }

  const minifyCss = (css) =>
    css
      .replace(/\s+/g, ' ')
      .replace(/\s*([:;{},])\s*/g, '$1')
      .replace(/;\}/g, '}')
      .trim()

  return `<style type="text/css">${minifyCss(
    styles.reduce(
      (result, style) =>
        `${result}\n${isFunction(style) ? style(breakpoint) : style}`,
      '',
    ),
  )}</style>`
}
