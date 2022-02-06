
export function connectExceptionToMessage (e) {
  if (e.error?.code === 'EAI_AGAIN') {
    return "Can't resolve host"
  }
  if (e.error?.code === 'ECONNREFUSED') {
    return 'Connection refused'
  }
  if (e.type === 'ERR' && e.payload) {
    return `${e.payload.code}: ${e.payload.message}`
  }
  return e.message || 'Connection failed'
}
