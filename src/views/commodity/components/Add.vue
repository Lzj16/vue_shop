<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示消息 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条 -->
      <el-steps :space="200" :active="activeIndex-0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 表单 -->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsRules"
        ref="addGoodsRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tabs标签页 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model.number="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model.number="addGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model.number="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类">
              <el-cascader
                expand-trigger="hover"
                :options="cateList"
                :props="cascaderProps"
                v-model="addGoodsForm.goods_cat"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="(item) in manyData" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox v-for="(value,i) in item.attr_vals" :key="i" :label="value" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item v-for="item in onlyData" :key="item.attr_id" :label="item.attr_name">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="upLoadURL"
              :headers="headerObj"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <!-- 添加按钮 -->
            <el-button type="primary" class="addBtn" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
      <img :src="previewPath" class="previewImg" />
    </el-dialog>
  </div>
</template>
<script>
import _ from "lodash";

export default {
  data() {
    return {
      // 当前选中项索引
      activeIndex: "0",
      // 商品表单
      addGoodsForm: {
        goods_name: "",
        goods_price: null,
        goods_weight: null,
        goods_number: null,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的介绍
        goods_introduce: "",
        // 商品的参数
        attrs: [],
      },

      // 添加商品表单校验
      addGoodsRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" },
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" },
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" },
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" },
        ],
      },
      // 商品分类数据
      cateList: [],
      // 商品分类数据配置项
      cascaderProps: {
        label: "cat_name",
        value: "cat_id",
        children: "children",
      },
      // 商品参数动态数据
      manyData: [],
      // 静态属性的数据
      onlyData: [],
      // 图片上传地址
      upLoadURL: "http://127.0.0.1:8888/api/private/v1/upload",
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: sessionStorage.getItem("token"),
      },
      // 上传图片路径
      previewPath: "",
      // 图片预览默认不显示
      previewVisible: false,
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    cateId() {
      return this.addGoodsForm.goods_cat.length == 3
        ? this.addGoodsForm.goods_cat[2]
        : null;
    },
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类数据失败！");
      }
      // console.log(res.data);
      this.cateList = res.data;
    },
    // 级联选择器选中项变化
    handleChange() {
      console.log("goods_cat", this.addGoodsForm.goods_cat);
    },
    // tab栏切换之前触发
    beforeTabLeave(activeName, oldActiveName) {
      // 在第一个标签页时
      if (oldActiveName === "0" && this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.error("请选择商品分类！");
        return false;
      }
    },
    // tab 被选中触发
    async tabClicked() {
      if (this.activeIndex === "1") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "many" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取动态参数列表失败！");
        }
        // console.log(res.data);
        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(" ");
        });
        this.manyData = res.data;
        // console.log(this.manyData);
      } else if (this.activeIndex === "2") {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: "only" },
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("获取静态属性失败！");
        }
        console.log(res.data);
        this.onlyData = res.data;
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      // console.log(file);
      this.previewPath = file.response.data.url;
      this.previewVisible = true;
    },
    // 移除图片
    handleRemove(file) {
      // console.log(file);
      // 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 从pics数组中找到该图片的索引
      const i = this.addGoodsForm.pics.findIndex((item) => {
        return item.pic === filePath;
      });
      // 从pics数组中删除该图片
      this.addGoodsForm.pics.splice(i, 1);
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // console.log(response);
      this.addGoodsForm.pics.push({
        pic: response.data.tmp_path,
      });
      // console.log(this.addGoodsForm);
    },
    // 添加商品
    addGoods() {
      this.$refs.addGoodsRef.validate( async (valid) => {
        if (!valid) {
          return this.$message.error("请填写必要的表单项！");
        }
        // 准备请求前的数据
        // 使用lodash工具的cloneDeep()方法，实现对象的深拷贝
        const form = _.cloneDeep(this.addGoodsForm);
        form.goods_cat = form.goods_cat.join(",");

        // 处理动态参数
        this.manyData.forEach((item) => {
          this.addGoodsForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(" "),
          });
        });
        // 处理静态属性
        this.onlyData.forEach((item) => {
          this.addGoodsForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals,
          });
        });
        form.attrs = this.addGoodsForm.attrs; // 最终提交到后台的是form对象
        console.log(form);
        // 发送请求，添加商品
        const {data:res} = await this.$http.post('goods',form);
        if (res.meta.status !== 201) {
          return this.$message.error("添加商品失败！");
        }
        this.$message.success("添加商品成功！");
        this.$router.push("/goods");
      });
    },
  },
};
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.addBtn {
  margin-top: 15px;
}
</style>