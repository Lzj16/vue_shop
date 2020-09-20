<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示消息 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" :closable="false" type="warning" show-icon></el-alert>
      <!-- 选择商品分类 -->
      <el-row class="cat_select">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cascaderProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="btnDisabled"
            @click="addDialogVisible=true"
          >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyData" border stripe>
            <el-table-column label="明细" type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item ,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(scope.row,i)"
                >{{item}}</el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">
                  +
                  New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="序号" type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="btnDisabled"
            @click="addDialogVisible=true"
          >添加属性</el-button>
          <!-- 静态属性表格 -->
          <el-table :data="onlyData" border stripe>
            <el-table-column label="明细" type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(scope.row,i)"
                >{{ item }}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">
                  +
                  New Tag
                </el-button>
              </template>
            </el-table-column>
            <el-table-column label="序号" type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加'+title"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="title" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改'+title"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="title" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择器的配置对象
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
      },
      // 级联选择器选中的id数组
      selectedKeys: [],
      // 动态参数
      manyData: [],
      // 静态属性
      onlyData: [],
      // 激活的标签页
      activeName: "many",
      // 添加对话框的显示和隐藏
      addDialogVisible: false,
      // 添加参数的表单对象
      addForm: {},
      // 添加参数的校验规则
      addFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
      // 修改对话框的显示和隐藏
      editDialogVisible: false,
      // 修改参数的表单对象
      editForm: {},
      // 修改参数的校验规则
      editFormRules: {
        attr_name: [
          { required: true, message: "请输入参数名称", trigger: "blur" },
        ],
      },
    };
  },
  created() {
    this.getCateList();
  },
  computed: {
    // 当前选中的三级分类的id
    cateId() {
      return this.selectedKeys.length == 3 ? this.selectedKeys[2] : null;
    },
    // 是否禁用按钮
    btnDisabled() {
      return this.selectedKeys.length == 3 ? false : true;
    },
    // 添加弹出框的标题文本
    title() {
      return this.activeName === "many" ? "动态参数" : "静态属性";
    },
  },
  methods: {
    // 获取分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get("categories");
      if (res.meta.status !== 200) {
        return this.$message.error("获取商品分类失败！");
      }
      this.cateList = res.data;
      // console.log(this.cateList);
    },
    // 获取分类参数数据
    async getParamsData() {
      // 判断是否选择三级分类
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = [];
        this.manyData = [];
        this.onlyData = [];
        return;
      }
      // 根据所选标签页，获取动态参数或静态属性
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      );
      if (res.meta.status !== 200) {
        return this.message.error("获取参数列表失败！");
      }
      // console.log(res.data);
      // 对参数的明细进行处理：按空格拆分为数组
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        item.inputVisible = false; // 控制文本框的显示与隐藏
        item.inputValue = ""; // 文本框中输入的值
      });
      // 判断是动态参数还是静态属性
      if (this.activeName === "many") {
        this.manyData = res.data;
      } else {
        this.onlyData = res.data;
      }
    },
    // 监听级联选择器的下拉菜单变化
    handleChange() {
      this.getParamsData();
    },
    // 监听标签页的点击
    handleClick() {
      this.getParamsData();
    },
    // 监听tag的关闭事件，删除对应的参数明细
    async handleClose(row, i) {
      // console.log(row,i);
      row.attr_vals.splice(i, 1);
      this.updateParamsDetail(row);
    },
    // 更新参数明细
    async updateParamsDetail(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(" "),
        }
      );
      if (res.meta.status !== 200) {
        return this.$message.error("更新参数明细失败！");
      }
      this.$message.success("更新参数明细成功！");
    },
    // 显示文本输入框
    showInput(row) {
      row.inputVisible = true;
      // 让文本自动获取焦点
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 文本框失去焦点 或 按下了Enter时触发
    async handleInputConfirm(row) {
      if (row.inputValue.trim()) {
        row.attr_vals.push(row.inputValue.trim());
        row.inputValue = "";
        row.inputVisible = false;
        // 执行更新操作
        this.updateParamsDetail(row);
      }
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    // 添加参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        );
        if (res.meta.status !== 201) {
          return this.$message.error("添加参数失败！");
        }
        this.addDialogVisible = false;
        this.getParamsData();
        this.$message.success("添加参数成功！");
      });
    },
    // 删除参数
    async removeParams(attrId) {
      this.$confirm("确定要删除吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.cateId}/attributes/${attrId}`
          );
          if (res.meta.status !== 200) {
            return this.$message.error("删除参数失败！");
          }
          this.$message.success("删除参数成功！");
          this.getParamsData();
        })
        .catch(() => {
          this.$message.info("已取消删除！");
        });
    },
    // 显示修改对话框
    async showEditDialog(attrId) {
      // 查询当前参数的信息
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrId}`,
        {
          params: { attr_sel: this.activeName },
        }
      );

      if (res.meta.status !== 200) {
        // console.log(res);
        return this.$message.error("获取参数信息失败！");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
      // console.log(this.editForm);
    },
    // 监听修改对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields();
    },
    // 修改参数
    async editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return;
        }
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
            attr_vals: this.editForm.attr_vals,
          }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("修改参数名称失败！");
        }

        this.$message.success("修改参数名称成功！");
        this.getParamsData();
        this.editDialogVisible = false;
      });
    },
  },
};
</script>
<style lang="less" scoped>
.cat_select {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 120px;
}
</style>