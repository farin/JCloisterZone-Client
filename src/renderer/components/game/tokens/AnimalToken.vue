<template>
  <svg viewBox="-1 -1 2 2">
    <circle r="1" fill="#ba9745" />
    <text x="-0.45" y="0.6" fill="white" style="font-size: 1.7px; font-weight: 600">{{ points }}</text>
  </svg>
</template>

<script>
export default {
  props: {
    points: { type: Number, required: true }
  }
}
</script>
