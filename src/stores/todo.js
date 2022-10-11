import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Storage } from '../utils'

export const useTodoStore = defineStore('todo', () => {
  const items = Storage.fetch()
  const list = ref(items)
  function addItem(newText) {
    const newItem = {
      id: Math.random().toString(36).slice(2),
      text: newText,
      defaultText: newText,
      status: 0,
      isEditor: false
    }
    list.value.push(newItem)
    Storage.save(list.value)
  }
  const deleteItem = (index)=> {
    list.value.splice(index, 1)
    Storage.save(list.value)
  }
  const updateItem = (newItem) => {
    const { id } = newItem
    if (id) {
      list.value = list.value.map(item => {
        if (item.id === id) item = { ...newItem }
        return item
      })
      Storage.save(list.value)
    }
  }
  return { list, addItem, deleteItem, updateItem }
})
