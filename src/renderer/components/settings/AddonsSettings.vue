<template>
  <div>
    <h3 class="mt-2 mb-4">Add-ons</h3>

    <AddonBox
      v-for="addon in $addons.addons"
      :key="addon.id"
      :addon="addon"
    />
  </div>
</template>

<script>
import AddonBox from '@/components/settings/AddonBox'

export default {
  components: {
    AddonBox
  }
}
</script>
