
export function connectExceptionToMessage (e) {
  if (e.error?.code === 'EAI_AGAIN') {
    return "Can't resolve host"
  }
  if (e.error?.code === 'ECONNREFUSED') {
    return 'Connection refused'
  }
  return e.message || 'Connection failed'
}
