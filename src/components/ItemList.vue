<template>
  <div class="list-wrap">
    <div
      class="item-row"
      v-for="(item, index) in todoEr.list || []"
      :key="item.id">
        <input
          class="row-checkbox"
          type="checkbox"
          name="check"
          :id="item.id"
          :checked="item.status"
          @change="switchHandle($event, item)">
        <span class="row-text">{{ item.text }}</span>
        <span class="delete-btn" @click="deleteHandle(index)">✖</span>
    </div>
    <div className="counts-status">
        <span class="finished-count">{{ filterHandle(todoEr.list).finishedDesc }}</span>
        <span class="left-count">{{ filterHandle(todoEr.list).leftDesc }}</span>
        <span class="total-count">{{ filterHandle(todoEr.list).allDesc }}</span>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue'
import { useTodoStore } from '../stores/todo'
export default defineComponent({
  setup() {
    const todoEr = useTodoStore()
    const deleteHandle = (index) => {
      todoEr.deleteItem(index)
    }
    const switchHandle = ($event, item) => {
      const { target } = $event
      const curState = (target && target.checked) ? 1 : 0
      const { status } = item
      if (curState != status) {
        const newItem = {
          ...item,
          status: curState
        }
        todoEr.updateItem(newItem)
      }
    }
    const filterHandle = (list) => {
      if (list && list.length) {
        const allCount = list.length
        const finishedList = list.filter(item => item.status)
        const unFinishedList = list.filter(item => !item.status)
        const finishedDesc = 'Completed: ' + finishedList.length
        const leftDesc = unFinishedList.length > 1 ? unFinishedList.length + ' Matters left' : unFinishedList.length + 'Matter left'
        const allDesc = allCount > 1 ? allCount + ' Matters' : allCount + 'Matter'
        return {
          finishedDesc,
          leftDesc,
          allDesc
        }
      }
    }
    return {
      todoEr,
      deleteHandle,
      switchHandle,
      filterHandle
    }
  },
  // filters: {
  //   filterCount(list) {
  //     console.log(list, 'wjf_filter_001')
  //     return 10
  //   }
  // }
})
</script>
<style scoped>
.list-wrap {
  position: relative;
  margin-top: 10px;
}
.item-row {
  height: 32px;
  line-height: 32px;
  position: relative;
  cursor: pointer;
  border-bottom: 1px dashed #f0f0f0;
}
.row-checkbox {
  position: relative;
  text-align: center;
  width: 24px;
  height: 24px;
  border: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  display: inline-block;
  vertical-align: middle;
  margin-right: 5px;
}
.row-checkbox:before {
  content: "\2714";
  font-size: 20px;
  color: #f0f0f0;
  text-shadow: #bfbfbf 0 -1px 0;
  cursor: pointer;
  transition: all .2s;
}
.row-checkbox:checked:before {
  color: #38b9b9;
  text-shadow: 0 1px 0 #669991;
}
.row-checkbox:checked + span {
  color: #e4393c;
  text-decoration: line-through;
}

.delete-btn {
  display: none;
  width: 24px;
  height: 24px;
  line-height: 24px;
  font-size: 20px;
  color: #e4393c;
  text-align: center;
  position: absolute;
  top: 4px;
  right: 5px;
  transition: all .5s;
  text-decoration: none;
}
.delete-btn:hover {
  transform: scale(1.1);
  text-shadow: 0 0 1px #000, 0 0 10px hsl(0deg 45% 60% / 80%);
}

.item-row:hover .delete-btn {
  display: block;
}


.counts-status {
  position: relative;
}
.counts-status span {
  font-size: 12px;
  color: #8ac007;
}
.counts-status span+span {
  margin-left: 15px;
}
</style>
