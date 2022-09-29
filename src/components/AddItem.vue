<template>
  <div class="add-wrap">
    <input
      v-model="typeText"
      type="text"
      ref="inputRef"
      @keyup="addHandle" />
  </div>
</template>
<script>
import { ref, defineComponent } from 'vue'
import { useTodoStore } from '../stores/todo'
export default defineComponent({
  setup(props) {
    const inputRef = ref()
    const typeText = ref('')
    const todoEr = useTodoStore()
    const addHandle = ($event) => {
      const { keyCode } = $event
      if (keyCode === 13) {
        todoEr.addItem(typeText.value)
        typeText.value = ''
      }
    }
    return {
      inputRef,
      typeText,
      addHandle
    }
  },
  mounted() {
    if (this.inputRef) this.inputRef.focus()
  }
})
</script>
<style scoped>
.add-wrap input {
  outline: none;
  display: block;
  width: 100%;
  padding: 10px;
  border: 1px solid #999;
  font-size: .35rem;
  transition: all .3s ease-in-out;
}
.add-wrap input:focus {
  box-shadow: 0 0 10px #999;
}
</style>
