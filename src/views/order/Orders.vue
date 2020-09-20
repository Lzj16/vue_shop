<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索 -->
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getOrderList">
            <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表 -->
      <el-table :data="orderList" border stripe>
        <el-table-column label="序号" type="index" width="50px"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column prop="order_price" label="订单价格"></el-table-column>
        <el-table-column label="是否付款">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_send" label="是否发货"></el-table-column>
        <el-table-column prop="create_time" label="下单时间"></el-table-column>
        <el-table-column label="操作">
          <template>
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="addressVisible = true"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location-outline"
              size="mini"
              @click="showProgressDialog"
            ></el-button>
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

    <!-- 修改地址对话框 -->
    <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%">
      <el-form
        :model="addressForm"
        :rules="addressFormRules"
        ref="addressFormRef"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-form-item label="省市区/县" prop="address1">
          <el-cascader v-model="addressForm.address1" :options="cityData" clearable></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addressVisible = false">取 消</el-button>
        <el-button type="primary" @click="addressVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流地址 -->
    <el-dialog title="物流进度" :visible.sync="logisticsVisible" width="50%">
      <el-timeline :reverse="reverse">
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.ftime"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>
<script>
import cityData from "./citydata.js";

export default {
  data() {
    return {
      // 订单列表
      orderList: [],
      // 订单列表请求参数
      queryInfo: {
        query: "",
        pagenum: 1, //页码
        pagesize: 5, //页大小
      },
      // 总页数
      total: 0,
      // 城市地址
      cityData,
      // 修改地址对话框默认不显示
      addressVisible: false,
      // 地址表单
      addressForm: {
        address1: [],
      },
      // 物流地址对话框默认关闭
      logisticsVisible: false,
      // 物流信息
      progressInfo: [],
      // 正序
      reverse: true,
      // 修改地址表单校验
      addressFormRules: {
        address1: [
          { required: true, message: "请选择省市区县", trigger: "blur" },
        ],
        address2: [
          { required: true, message: "请填写详细地址", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getOrderList();
  },
  methods: {
    // 获取订单列表
    async getOrderList() {
      const { data: res } = await this.$http.get("orders", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取失败！");
      }
      // console.log(res);
      this.orderList = res.data.goods;
      this.total = res.data.total;
      this.orderList.forEach((item) => {
        return (item.create_time = this.getDateStr(item.create_time));
      });
    },
    // 时间转换
    getDateStr(seconds) {
      let date = new Date(seconds * 1000);
      let year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let hour = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
      let minute =
        date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
      let second =
        date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
      let currentTime =
        year +
        "-" +
        month +
        "-" +
        day +
        "  " +
        hour +
        ":" +
        minute +
        ":" +
        second;
      return currentTime;
    },
    // 每页展示大小改变
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getOrderList();
    },
    // 页面跳转
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getOrderList();
    },
    // 显示物流信息
    async showProgressDialog() {
      const { data: res } = await this.$http.get("/kuaidi/804909574412544580");
      if (res.meta.status !== 200) {
        return this.$message.error("获取物流进度失败！");
      }
      // console.log(res.data);
      this.progressInfo = res.data;
      this.logisticsVisible = true;
    },
  },
};
</script>
<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>