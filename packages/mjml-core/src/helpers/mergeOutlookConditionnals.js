// Merge adjacent MSO conditionals, but keep negation wrappers intact:
// `<!--[if !mso]><!--> ... <!--<![endif]-->`
// If we remove `<![endif]--><!--[if mso | IE]>` inside that sequence,
// Outlook fallback openings get commented out (`<!--<table ...`).
export default (content) =>
  content.replace(/(?<!<!--)<!\[endif]-->\s*<!--\[if mso \| IE]>/gm, '')
