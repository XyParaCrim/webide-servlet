export const EmptyArray = Object.freeze([])

export function unSupportedHandler() {
  throw Error() // TODO
}

export function loadFile() {

}

export function resolveIteratorValues(iterator) {
  return Object.values(iterator)
}

export function handleServletError(servlet, error, message) {

}