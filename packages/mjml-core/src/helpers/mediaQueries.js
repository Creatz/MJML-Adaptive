import { map, isEmpty } from 'lodash'

// eslint-disable-next-line import/prefer-default-export
export default function buildMediaQueriesTags(
  breakpoint,
  mediaQueries = {},
  options = {},
) {
  if (isEmpty(mediaQueries)) {
    return ''
  }

  const { forceOWADesktop = false, printerSupport = false } = options
  const minifyCss = (css) =>
    css
      .replace(/\s+/g, ' ')
      .replace(/\s*([:;{},])\s*/g, '$1')
      .replace(/;\}/g, '}')
      .trim()

  const baseMediaQueries = map(
    mediaQueries,
    (mediaQuery, className) => `.${className} ${mediaQuery}`,
  )
  const thunderbirdMediaQueries = map(
    mediaQueries,
    (mediaQuery, className) => `.moz-text-html .${className} ${mediaQuery}`,
  )
  const owaQueries = map(baseMediaQueries, (mq) => `[owa] ${mq}`)

  const desktopCss = minifyCss(
    `@media only screen and (min-width:${breakpoint}) { ${baseMediaQueries.join(
      ' ',
    )} }`,
  )
  const thunderbirdCss = minifyCss(thunderbirdMediaQueries.join(' '))
  const printCss = minifyCss(
    `@media only print { ${baseMediaQueries.join(' ')} }`,
  )
  const owaCss = minifyCss(owaQueries.join(' '))

  return `
    <style type="text/css">${desktopCss}</style>
    <style media="screen and (min-width:${breakpoint})">${thunderbirdCss}</style>
    ${printerSupport ? `<style type="text/css">${printCss}</style>` : ``}
    ${forceOWADesktop ? `<style type="text/css">${owaCss}</style>` : ``}
  `
}
