<template>
  <div class="about">
    <h1>{{ pageText }}</h1>
  </div>
</template>

<script>
import { ref, defineComponent } from 'vue'
export default defineComponent({
  props: {
    title: String
  },
  setup(props) {
    const pageText = ref('About')
    return {
      pageText
    }
  }
})
</script>

<style scoped>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    /* display: flex; */
    align-items: center;
  }
}
.toto-content {
  position: relative;
}
.toto-content li {
  position: relative;
}
.toto-content li button {
  display: none;
  position: absolute;
  right: 0;
  top: 0;
  z-index: 2;
}
.toto-content li:hover button {
  display: block;
}
</style>
