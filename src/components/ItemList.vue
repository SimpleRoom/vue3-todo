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
        <div class="row-show">
          <span class="row-text" @dblclick="switchEditorHandle(item)">{{ item.text }}</span>
          <input
            type="text"
            class="row-editor-input"
            v-if="item.isEditor"
            v-model="item.text"
            ref="editorInputRef"
            :id="`focusElem${item.id}`"
            :data-default="item.defaultText"
            @focus="focusHandle"
            @blur="blurHandler($event, item)"
            @keyup="enterHandle($event, item)" />
          <span v-if="!item.isEditor" class="delete-btn" @click="deleteHandle(index)">✖</span>
        </div>
    </div>
    <div className="counts-status">
      <span class="finished-count">{{ filterHandle(todoEr.list).finishedDesc }}</span>
      <span class="left-count">{{ filterHandle(todoEr.list).leftDesc }}</span>
      <span class="total-count">{{ filterHandle(todoEr.list).allDesc }}</span>
    </div>
  </div>
</template>
<script>
import { ref, defineComponent, nextTick } from 'vue'
import { useTodoStore } from '../stores/todo'
export default defineComponent({
  setup() {
    // 用于控制enter和blur事件叠加
    const isFocus = ref(false)
    const editorInputRef = ref()
    const todoEr = useTodoStore()
    const deleteHandle = (index) => {
      todoEr.deleteItem(index)
    }
    // 切换选中
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
    // 底部完成和未完成数量统计
    const filterHandle = (list) => {
      let todoInfo = {
        finishedDesc: 'Completed: 0',
        leftDesc: '0 Matter left',
        allDesc: '0 Matter'
      }
      if (list && list.length) {
        const allCount = list.length
        const finishedList = list.filter(item => item.status)
        const unFinishedList = list.filter(item => !item.status)
        todoInfo.finishedDesc = 'Completed: ' + finishedList.length
        todoInfo.leftDesc = unFinishedList.length > 1 ? unFinishedList.length + ' Matters left' : unFinishedList.length + ' Matter left'
        todoInfo.allDesc = allCount > 1 ? allCount + ' Matters' : allCount + ' Matter'
      }
      return todoInfo
    }
    // 双击切换为编辑状态
    const switchEditorHandle = (curItem) => {
      const { id } = curItem
      const editorItem = {
        ...curItem,
        isEditor: true
      }
      todoEr.updateItem(editorItem)
      nextTick(()=> {
        const focusElem = document.getElementById(`focusElem${id}`)
        focusElem && focusElem.focus()
      })
    }
    // 确定修改更新
    const confirmHandle = ($event, item) => {
      const { target } = $event
      let defaultText = ''
      if (target) defaultText = target.getAttribute('data-default')
      const newItem = {
        ...item,
        isEditor: false
      }
      if (target.value != defaultText) {
        newItem['text'] = target.value
      }
      todoEr.updateItem(newItem)
    }
    // 编辑时enter的保存，可能会和blur事件冲突
    const enterHandle = ($event, item) => {
      const { keyCode } = $event
      if (keyCode === 13) {
        // 限制失去事件
        isFocus.value = false
        console.log('enter_update')
        confirmHandle($event, item)
      }
    }
    // 获取焦点
    const focusHandle = () => {
      isFocus.value = true
    }
    // 失去焦点注意和enter事件重叠
    const blurHandler = ($event, item) => {
      if (isFocus.value) {
        console.log('blue_update')
        confirmHandle($event, item)
      }
    }
    return {
      todoEr,
      editorInputRef,
      isFocus,
      deleteHandle,
      switchHandle,
      filterHandle,
      switchEditorHandle,
      enterHandle,
      focusHandle,
      blurHandler
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
  height: 36px;
  line-height: 36px;
  position: relative;
  cursor: pointer;
  border-bottom: 1px dashed #f0f0f0;
  display: flex;
  align-items: center;
}
.row-show {
  position: relative;
  flex-grow: 1;
  height: 100%;
}
.row-text {
  display: inline-block;
  width: 100%;
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
  margin-right: 6px;
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


.row-editor-input {
  position: absolute;
  width: 94%;
  left: 0;
  top: 0;
  height: 100%;
  outline: none;
  border: 1px solid #8ac007;
  color: #8ac007;
  transition: all .3s ease-in-out;
  padding-left: 8px;
}
.row-editor-input:focus{
  box-shadow: 0 0 5px #8ac007;
}
.row-text.editoring+.row-editor-input {
  display: block;
}
</style>
