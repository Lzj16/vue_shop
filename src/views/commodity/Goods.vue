<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索和添加 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" @clear="getGoodsList" clearable>
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addGoods">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 商品列表 -->
      <el-table :data="goodsList" border stripe>
        <!-- 索引 -->
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="600px"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量" width="50px"></el-table-column>
        <el-table-column label="创建时间" width="150px">
          <template slot-scope="scope">
              {{scope.row.add_time | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeGoodsById(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品列表
      goodsList: [],
      // 商品列表请求参数对象
      queryInfo: {
        query: "",
        pagenum: 1, //当前页码
        pagesize: 5, //页大小
      },
      // 总条数
      total: 0,
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    // 获取商品列表
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("请求失败！");
      }
      this.goodsList = res.data.goods;
      this.total = res.data.total;
      // console.log(this.goodsList);
    },
    // 每页展示大小改变
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getGoodsList();
    },
    // 页面跳转
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getGoodsList();
    },
    // 添加商品
    addGoods(){
      this.$router.push('/goods/add')
    },
    // 删除商品
    removeGoodsById(goods){
      // console.log(goods);
      this.$confirm("确定要删除该商品吗？","提示",{
        confirmText:'确定',
        cancelText:'取消',
        type:'warning'
      })
        .then( async () => {
          const {data:res} = await this.$http.delete(`goods/${goods.goods_id}`);
          if(res.meta.status !== 200){
            return this.$message.error('删除失败！');
          }
          this.getGoodsList();
          this.$message.success('删除成功!');
        })
        .catch( () => {
          this.$message.info('已取消删除！');
        })
    }
  },
};
</script>
<style lang="less">
</style>