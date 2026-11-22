// The one shape still drawn in code: the Mughal ogee arch, used to mask portraits and frame the union card.
export const ARCH =
  'M0,300 L0,128 C0,78 38,52 70,38 C88,30 97,16 100,0 C103,16 112,30 130,38 C162,52 200,78 200,128 L200,300 Z'

export const archMaskURI = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" preserveAspectRatio="none"><path d="${ARCH}"/></svg>`,
)}")`
