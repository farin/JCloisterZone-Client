import random from 'random-bigint'
import { v4 as uuidv4 } from 'uuid'

export function randomId () {
  return uuidv4().replaceAll('-', '')
}

export function randomLong () {
  return random(64) - 9223372036854775808n
}

export function randomInt (min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min) + min) // The maximum is exclusive and the minimum is inclusive
}
