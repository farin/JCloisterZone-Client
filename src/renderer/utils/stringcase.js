
export function toKebabCase (val) {
  return val
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(t => t.toLowerCase())
    .join('-')
}
