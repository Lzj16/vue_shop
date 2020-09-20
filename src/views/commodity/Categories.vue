<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 商品分类数据tree-table表格 -->
      <tree-table
        :data="categoriesList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        border
        show-index
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-error" style="color:red;" v-if="scope.row.cat_deleted"></i>
          <i class="el-icon-success" style="color:lightgreen;" v-else></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warninng" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operate" slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            class="el-icon-edit"
            @click="showChangeDialog(scope.row)"
          >编辑</el-button>
          <el-button
            type="danger"
            size="mini"
            class="el-icon-delete"
            @click="removeClassifyById(scope.row)"
          >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addClassifyDialogVisible"
      width="50%"
      @close="addClassifyDialogClosed"
    >
      <el-form
        :model="addClassifyForm"
        :rules="addClassifyRules"
        ref="addClassifyRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addClassifyForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addClassifyDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addClassifyById">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="changeDialogVisible"
      width="50%"
      @close="changeDialogClosed"
    >
      <el-form
        :model="changeClassifyForm"
        :rules="changeClassifyRules"
        ref="changeClassifyRef"
        label-width="100px"
      >
        <el-form-item label="分类名" prop="cat_name">
          <el-input v-model="changeClassifyForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="changeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="changeClassifyById">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类数据列表
      categoriesList: [],
      // 商品分类数据请求参数
      queryInfo: {
        type: [],
        pagenum: 1,
        pagesize: 5,
      },
      // 总数
      total: 0,
      // tree-table表格各列的配置
      columns: [
        {
          label: "分类名称",
          prop: "cat_name",
        },
        {
          label: "是否有效",
          type: "template",
          template: "isOk",
        },
        {
          label: "排序",
          type: "template",
          template: "order",
        },
        {
          label: "操作",
          type: "template",
          template: "operate",
        },
      ],
      // 添加分类对话框默认关闭
      addClassifyDialogVisible: false,
      // 添加分类表单
      addClassifyForm: {
        cat_name: "", //分类名称
        cat_pid: 0, //父级分类的id
        cat_level: 0, //分类等级，默认为一级分类
      },
      // 添加分类表单校验
      addClassifyRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
      // 父级分类列表
      parentCateList: [],
      // 级联选择器配置对象
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 级联选择器选中的id数组
      selectedKeys: [],
      // 修改分类对话框默认关闭
      changeDialogVisible: false,
      // 修改分类表单
      changeClassifyForm: {
        cat_id: "",
        cat_name: "",
      },
      // 分类名称校验
      changeClassifyRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCategoriesList();
  },
  methods: {
    async getCategoriesList() {
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo,
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取失败！");
      }
      this.categoriesList = res.data.result;
      this.total = res.data.total;
      // console.log(this.categoriesList);
    },
    // 每页展示大小改变
    handleSizeChange(pagesize) {
      this.queryInfo.pagesize = pagesize;
      this.getCategoriesList();
    },
    // 页面跳转
    handleCurrentChange(pagenum) {
      this.queryInfo.pagenum = pagenum;
      this.getCategoriesList();
    },
    // 获取父级分类数据
    async getParentCateList() {
      const { data: res } = await this.$http.get("categories", {
        params: { type: 2 },
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取父级分类数据失败！");
      }
      // console.log(res.data);
      this.parentCateList = res.data;
    },
    // 显示添加分类对话框
    showAddDialog() {
      this.getParentCateList();
      this.addClassifyDialogVisible = true;
    },
    // 监听级联选择器的下拉菜单变化
    handleChange() {
      if (this.selectedKeys.length){
        this.addClassifyForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addClassifyForm.cat_level = this.selectedKeys.length;
      }else{
        this.addClassifyForm.cat_pid = 0;
        this.addClassifyForm.cat_level = 0;
      }
    },
    // 添加分类
    addClassifyById() {
      console.log(this.selectedKeys);
      this.$refs.addClassifyRef.validate( async (valid) => {
        if(!valid){
          return
        }
        const {data:res} = await this.$http.post('categories',this.addClassifyForm);
        // console.log(res);
        if(res.meta.status !== 201){
          return this.$message.error('添加分类失败！');
        }
        this.$message.success('添加分类成功！');
        this.getCategoriesList();
        this.addClassifyDialogVisible = false;
      })
    },
    // 关闭添加分类对话框
    addClassifyDialogClosed(){
      this.$refs.addClassifyRef.resetFields();
      this.selectedKeys = [];
      this.addClassifyForm.cat_pid = 0;
      this.addClassifyForm.cat_level = 0
    },
    // 修改分类对话框编辑
    async showChangeDialog(cat) {
      // console.log(role);
      const { data: res } = await this.$http.get(`categories/${cat.cat_id}`);
      console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("获取失败！");
      }
      // console.log(res.data.cat_name);
      this.changeClassifyForm = res.data;
      this.changeDialogVisible = true;
    },
    // 关闭修改分类对话框时清空表单
    changeDialogClosed() {
      this.$refs.changeClassifyRef.resetFields();
    },
    // 编辑提交分类
    async changeClassifyById() {
      const { data: res } = await this.$http.put(
        `categories/${this.changeClassifyForm.cat_id}`,
        {
          cat_name: this.changeClassifyForm.cat_name,
        }
      );
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error("更新失败!");
      }
      this.changeDialogVisible = false;
      this.getCategoriesList();
      this.$message.success("更新成功！");
    },
    // 删除分类
    removeClassifyById(cat) {
      this.$confirm("确定要删除该分类吗？", "提示", {
        confirmText: "确定",
        cancelText: "取消",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${cat.cat_id}`
          );
          if (res.meta.status !== 200) {
            return this.$message.error("删除失败！");
          }
          this.getCategoriesList();
          this.$message.success("删除成功！");
        })
        .catch(() => {
          this.$message.info("已取消删除！");
        });
    },
  },
};
</script>
<style lang="less" scoped>
.el-row {
  .el-button {
    margin-bottom: 15px;
  }
}
.el-cascader {
  width: 100%;
}
</style>