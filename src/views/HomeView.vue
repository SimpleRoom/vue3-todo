<template>
  <main data-key="MAIN_WRAP" class="main  ">
    <div class="todo-wrap">
      <h3 class="title">vue3 todo</h3>
      <AddItem />
      <ItemList />
    </div>
    
  </main>
</template>

<script setup>
import AddItem from '../components/AddItem.vue'
import ItemList from '../components/ItemList.vue'

</script>
<style scoped>
.todo-wrap {
  background-color: #fff;
  box-shadow: 0 2px 6px 0 rgb(0 0 0 / 20%), 0 25px 50px 0 rgb(0 0 0 / 15%);
  width: 540px;
  margin: 0 auto;
  padding: 30px;
}
.title {
  margin: 0;
  margin-bottom: 10px;
  text-align: center;
  font-size: 24px;
  font-style: italic;
  text-shadow: -1px -1px rgb(0 0 0 / 20%);
  font-weight: 700;
  color: #38b9b9;
  text-transform: uppercase;
}
</style>
