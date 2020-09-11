import random from 'random-bigint'

export function randomLong () {
  return random(64) - 9223372036854775808n
}
