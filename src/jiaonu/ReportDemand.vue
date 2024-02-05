<template>
  <div id="viewPageElem" data-key="AREA_REPORT" class="custom-page-wrap">
    <div class="top-btn-wrap br-bt-eee">
      <template v-if="topBtnList && topBtnList.length">
        <div class="left-btn-wrap">
          <template v-for="(btn,index) in topBtnList" :key="index">
            <el-button
              type="primary"
              size="small"
              :data-index="index"
              @click="commonClickHandle(btn.key)">
              <el-icon><component :is="btn.iconName"/></el-icon>{{ btn.desc }}
            </el-button>
          </template>
        </div>
        <!-- <div
          v-if="topBtnList[topBtnList.length - 1] && topBtnList[topBtnList.length - 1].key=='TOOLS'"
          class="right-btn-wrap">
          <el-button
            type="primary"
            size="small"
            @click="commonClickHandle(topBtnList[topBtnList.length - 1].key)">
            {{ topBtnList[topBtnList.length - 1].desc }}
            <el-icon><component :is="topBtnList[topBtnList.length - 1].iconName" /></el-icon>
          </el-button>
        </div> -->
      </template>
    </div>
    <div class="main-content" :data-height="tableHeight">
      <Rtable
        :isLoading="isLoading"
        :tableHeight="tableHeight"
        :tableHead="tableHead"
        :tableData="tableData"
        :getSummariesFn="getSummariesFn" />
    </div>
    <div class="page-wrap">
      <el-pagination
        v-model:current-page="pageConfig.currentPage"
        v-model:page-size="pageConfig.pageSize"
        :page-sizes="pageConfig.pageSizeList"
        small
        :disabled="false"
        :background="true"
        :hide-on-single-page="false"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pageConfig.pageTotal"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <el-dialog
    v-model="filterVisible"
    title="条件筛选"
    width="700"
    class="custom-class"
  >
    <goodsFilter ref="goodsFilterData" :showOrigin="false" :showDesc="false" :showContent="false"></goodsFilter>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" :loading="isLoading" @click="loadDataFn()">确定</el-button>
        <el-button @click="filterVisible = false">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script>
import { ref, defineComponent } from 'vue';
import Rtable from '@/components/ReportTable.vue';
import goodsFilter from '@/components/goodsFilter.vue'
// 数据源
import {
  mockRes, //假数据,最后删除
  topBtns,
  staticReportHead,//坐标固定列表头
  areaList,// 夸尺寸组的区域表头
  sizeList,// 尺寸组
  realReportHead,//真实的表头
} from '../staticDb/reportDemandDb.js';
import {
  loadAreaReportApi
} from '@/api/areaReportApi.js'

export default defineComponent({
  components: {
    Rtable,
    goodsFilter
  },
  setup(props) {
    const topBtnList = ref(topBtns);
    const staticAreaList = ref(areaList);
    const staticSizeList = ref(sizeList);
    const asyncSizeList = ref([]);
    const staticHead = ref(staticReportHead);
    const tableHead = ref([]);
    const tableData = []// ref([]);
    const isLoading = ref(false);
    const tableHeight = 480;
    const filterVisible = ref(false)
    const goodsFilterData = ref(null)
    const sizeGroupList = [];//表头的区域尺寸组
    const pageConfig = {
      currentPage: 1,
      pageSize: 50,
      pageSizeList: [50, 100, 200, 300, 500],
      pageTotal: 0,
    }
    return {
      topBtnList,
      staticAreaList,
      staticSizeList,
      asyncSizeList,
      staticHead,
      sizeGroupList,
      tableHead,
      tableData,
      isLoading,
      tableHeight,
      pageConfig,
      filterVisible,
      goodsFilterData
    }
  },
  mounted() {
    window.parent.document.title = '分区需求报表'
    this.calcWrapFn();
    // this.loadDataFn();
  },
  methods: {
    commonClickHandle(type) {
      switch(type) {
        case 'QUERY':
          this.filterVisible = true
          break;
      }
    },
    // 查询加载数据
    async loadDataFn(option = {}) {
      if (this.isLoading) return;
      this.filterVisible = false
      // const { tempPageNum, tempPageSize } = option || {};
      const reqData = {
        // origIds: this.goodsFilterData.filterForm.origIds,
        areaFilter: this.goodsFilterData.filterForm.areaFilter,
        productFilter: this.goodsFilterData.filterForm.productFilter,
        currentPage: this.pageConfig.currentPage,
        pageSize: this.pageConfig.pageSize
      }
      this.isLoading = true;
      this.tableData = [];
      // 
      // mock-s
      // const {data} = mockRes;
      // mock-e
      try {
        const {data} = await loadAreaReportApi(reqData);
        const result = data[0] || {};
        this.pageConfig.pageTotal = data.totCount || 0
        const { skuItem = [], sizes = [] } = result;
        const { martixList, groupSizeList } = this.filterTempSizesFn(sizes);
        this.asyncSizeList = martixList;//仅仅用于夸列尺寸组明细的值显示
        this.sizeGroupList = groupSizeList;//二维数组页面区域夸列表头的渲染
        // this.asyncSizeList = sizes.map(v => {
        //   return {
        //     title: v,
        //     key: v
        //   }
        // })
        this.tableHead = this.mapSetHeadFn()
        let resetList = [];
        if (skuItem && skuItem.length) {
          resetList = this.mapSetDataFn(skuItem);
        }
        this.tableData = resetList || [];
        this.isLoading = false;
      } catch {
        this.isLoading = false
      }
    },
    /**
     * @param {*} sizeList 接口返回的
     * 组合矩阵列表，用于每行明细的值显示
     * 尺寸组列表的和矩阵列表个数不一，没有补: {}
     */
    filterTempSizesFn(sizeList = []) {
      // 尺寸列表矩阵列表 [{title:"00",key:"00"}, {title:"01",key:"01"}, ...]
      const martixInfo = {};
      let martixList = [];
      for (let i = 0; i < sizeList.length; i++) {
        const groupItem = sizeList[i] || {};
        const { size = [] } = groupItem;
        if (size && size.length) {
          size.forEach(sItem => {
            const { martixcol } = sItem;
            const hasKey = martixInfo[martixcol] || null;
            if (!hasKey) {
              martixInfo[martixcol] = martixcol;
              martixList.push({
                title: martixcol,
                key: martixcol,//每行明细值使用的key
              })
            }
          })
        }
      }
      const groupSizeList = [];// [[{title:"xx",key:"",martixKey: ""}..],[..]]
      if (martixList && martixList.length) {
        for (let j = 0; j < sizeList.length; j++) {
          const tempSize = [];
          const tempGroup = sizeList[j] || {};
          const { size = [] } = tempGroup || {};
          // 不存在追加空
          for (let mIndex = 0; mIndex < martixList.length; mIndex++) {
            let tempSizeItem = size[mIndex] || null;
            const martixItem = martixList[mIndex] || {};
            const { key = "" } = martixItem;
            if (tempSizeItem && tempSizeItem.martixcol == key) {
              tempSizeItem = {
                ...tempSizeItem,
                title: tempSizeItem.sizeName,
                key: key,
              }
              tempSize.push(tempSizeItem);
            } else {
              tempSize.push({});
            }
          }
          groupSizeList.push(tempSize);
        }
      }
      // console.log(groupSizeList, martixList, 'fullSizeList_008')
      return { martixList, groupSizeList };
    },
    mapSetHeadFn() {
      const staticMHead = this.staticHead
      const sizeList = this.asyncSizeList
      const areaList = this.staticAreaList
      const copyHead = [...staticMHead];
      // 区域夸列个数
      const maxColspan = sizeList.length;
      for (let i = 0; i < areaList.length; i++) {
        const areaItem = areaList[i];
        areaItem["colspan"] = maxColspan;
        // 表头夸列的尺寸矩阵列表:明细值取值
        areaItem["colHead"] = [];
        for (let j = 0; j < sizeList.length; j++) {
          const sizeItem = sizeList[j];
          areaItem["colHead"].push({
            ...sizeItem,
            VALUE_KEY: `${areaItem.key}_${sizeItem.key}`
          })
        }
        // 表头夸列尺寸组表头显示:二维数组
        areaItem["sizeGroups"] = this.sizeGroupList;
        // 追加一个夸列的区域
        copyHead.push(areaItem);
        // 追加一个合计
        copyHead.push({
          isSum: true,
          title: "合计",
          key: "SUM_COUNT",//用于最底部行总计
          VALUE_KEY: `${areaItem.key}_SUM`
        })
      }
      return copyHead;
    },
    // 组合返回的数据
    mapSetDataFn(list = []) {
      const areaHeads = this.staticAreaList || [];
      const sizeList = this.asyncSizeList || [];
      const areaStyleGroup = {};
      const endList = list.reduce((prev, current) => {
        const areaStyle = `${current.areaName}_${current.name}`
        const areaStyleIndex = areaStyleGroup[areaStyle];
          if (!areaStyleIndex && areaStyleIndex !== 0) {
            const index = prev.length;
            const rowItem = { ...current };
            for (let i = 0; i < areaHeads.length; i++) {
              const areaItem = areaHeads[i] || {};
              const { key } = areaItem;
              rowItem[`${key}_SUM`] = 0;
              // 尺寸夸列值显示使用的key: 区域key_行矩阵号值["00","01",..] 如 qtyAllotrem_03
              rowItem[`${key}_${current.martixcol}`] = Number(current[key]) || "";
              for (let j = 0; j < sizeList.length; j++) {
                const sizeItem = sizeList[j] || {};
                const sizeKey = sizeItem.key;
                // 每个区域尺寸组合计
                let tempSum = rowItem[`${key}_${sizeKey}`] || 0;
                tempSum = tempSum ? Number(tempSum) : 0;
                rowItem[`${key}_SUM`] += tempSum;
              }
            }
            areaStyleGroup[areaStyle] = index;
            prev.push(rowItem)
          } else {
            for (let i = 0; i < areaHeads.length; i++) {
              const areaItem = areaHeads[i] || {};
              const { key } = areaItem;
              prev[areaStyleIndex][`${key}_SUM`] = 0;
              // 尺寸夸列值显示使用的key: 区域key_行矩阵号值["00","01",..] 如 qtyAllotrem_03
              prev[areaStyleIndex][`${key}_${current.martixcol}`] = Number(current[key]) || "";
              for (let j = 0; j < sizeList.length; j++) {
                const sizeItem = sizeList[j] || {};
                const sizeKey = sizeItem.key;
                // 每个区域尺寸组合计
                let tempSum = prev[areaStyleIndex][`${key}_${sizeKey}`] || 0;
                tempSum = tempSum ? Number(tempSum) : 0;
                prev[areaStyleIndex][`${key}_SUM`] += tempSum;
              }
            }
          }
        return prev
      }, [])
      return endList;
    },
    handleSizeChange(val) {
      this.pageConfig.pageSize = val
      this.pageConfig.currentPage = 1
      this.loadDataFn();
    },
    handleCurrentChange(val) {
      this.pageConfig.currentPage = val
      this.loadDataFn();
    },
    // 初始化计算视觉页面宽高
    calcWrapFn() {
      try {
        const $viewElem = document.getElementById("viewPageElem");
        if ($viewElem) {
          const wrapPosition = $viewElem.getBoundingClientRect();
          const { width, height } = wrapPosition || {};
          this.tableHeight = height - (50 + 34) - 20;
          // console.log(wrapPosition, 'wrapPosition_001');
        }
      } catch (error) {
        console.log('calc_width_error', error);
      }
    },
    // 底部的总计
    getSummariesFn(param) {
      const {columns, data} = param || {};
      const sums = [];
      const amountArr = this.mapSumKeyFn();//["qtyAreaCan_SUM"]
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = '合计'
          return
        }
        const values = data.map((item) => Number(item[column.property]));
        if (amountArr.indexOf(column.property) !== -1) {
          if (!values.every((value) => Number.isNaN(value))) {
            sums[index] = `${values.reduce((prev, curr) => {
              const value = Number(curr)
              if (!Number.isNaN(value)) {
                return prev + curr
              } else {
                return prev
              }
            }, 0)}`
          } else {
            sums[index] = ''
          }
        }
      })
      return sums
    },
    // 组合底部总计需要显示的列
    mapSumKeyFn() {
      const sumKeys = this.tableHead.map(item => {
        if (item.key == "SUM_COUNT") return item.VALUE_KEY;
      });
      return sumKeys;
    }
  }
})
</script>
<style scoped lang="scss">
.top-btn-wrap {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 2px 0 12px;
  button {
    .el-icon {
      margin-right: 2px;
    }
  }
}
.page-wrap {
  padding: 10px;
  display: flex;
  justify-content: center;
}
</style>