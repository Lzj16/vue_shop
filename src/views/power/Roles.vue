<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表 -->
      <el-table :data="rolesList" border stripe>
        <el-table-column label="明细" type="expand">
          <template slot-scope="scope">
            <el-row
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
              :class="{vcenter:true,bdbottom:true,bdtop:i1===0}"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
              </el-col>
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                  :class="{vcenter:true,bdtop:i2!==0}"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                  </el-col>
                  <el-col :span="18">
                    <!-- 渲染三级权限 -->
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      type="warning"
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditRoleDialog(scope.row)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRoleById(scope.row)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="rightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        :data="rightsList"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultKeys"
        :props="treeProps"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="rightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialogVisible"
      width="50%"
      @close="addRoleDialogClosed"
    >
      <el-form :model="addRoleForm" :rules="addRoleRules" ref="addRoleRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog
      title="修改角色"
      :visible.sync="editRoleDialogVisible"
      width="50%"
      @close="editRoleDialogClosed"
    >
      <el-form :model="editRoleForm" :rules="editRoleRules" ref="editRoleRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      // 角色列表
      rolesList: [],
      // 权限列表
      rightsList: [],
      // 分配权限对话框默认不显示
      rightDialogVisible: false,
      // 默认勾选的节点的 key 的数组
      defaultKeys: [],
      treeProps: {
        children: "children",
        label: "authName",
      },
      // 添加角色对象
      addRoleForm: {
        roleName: "",
        roleDesc: "",
      },
      // 添加角色对话框默认不显示
      addRoleDialogVisible: false,
      // 添加角色表单校验规则
      addRoleRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
      // 修改角色对象
      editRoleForm: {},
      // 修改角色对话框默认关闭
      editRoleDialogVisible: false,
      editRoleRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" },
        ],
      },
      roleId:'',
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) {
        return this.$message.error("角色列表获取失败！");
      }
      // console.log(res);
      this.rolesList = res.data;
    },
    // 删除角色指定权限
    removeRightById(role, rightId) {
      // console.log(role);
      this.$confirm("确定删除该权限吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          );
          if (res.meta.status !== 200) {
            return this.$message.error("删除权限失败！");
          }
          role.children = res.data;
        })
        .catch(() => {
          this.$message.info("已取消删除！");
        });
    },
    // 获取所有权限列表
    async showRightDialog(role) {
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) {
        return this.$message.error("获取权限列表失败！");
      }
      // console.log(res);
      this.rightsList = res.data;
      this.getLeafKeys(role, this.defaultKeys);
      // 存储当前要分配权限的角色id
      this.roleId = role.id;
      this.rightDialogVisible = true;
    },
    // 获取所有三级权限id
    getLeafKeys(node, arr) {
      // 判断是否为三级权限
      if (!node.children) {
        return arr.push(node.id);
      }
      // 如果不是三级权限，执行递归操作
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr);
      });
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defaultKeys = [];
    },
    // 添加角色
    async addRole() {
      const { data: res } = await this.$http.post("roles", this.addRoleForm);
      if (res.meta.status !== 201) {
        return this.$message.error("添加角色失败！");
      }
      this.getRolesList();
      this.addRoleDialogVisible = false;
      this.$message.success("添加角色成功！");
    },
    // 清空添加角色表单
    addRoleDialogClosed() {
      this.$refs.addRoleRef.resetFields();
    },
    // 根据id查询角色
    async showEditRoleDialog(role) {
      const { data: res } = await this.$http.get(`roles/${role.id}`);
      if (res.meta.status !== 200) {
        return this.$message.error("角色获取失败！");
      }
      this.editRoleForm = res.data;
      console.log(this.editRoleForm);
      this.editRoleDialogVisible = true;
    },
    // 编辑提交角色
    async editRole() {
      const { data: res } = await this.$http.put(
        `roles/${this.editRoleForm.roleId}`,
        {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc,
        }
      );
      // console.log(this.editRoleForm.roleId, res);
      if (res.meta.status !== 200) {
        return this.$message.error("角色更新失败！");
      }
      this.getRolesList();
      this.editRoleDialogVisible = false;
      this.$message.success("编辑角色成功！");
    },
    // 清空修改角色表单
    editRoleDialogClosed() {
      this.$refs.editRoleRef.resetFields();
    },
    // 删除角色
    removeRoleById(role) {
      this.$confirm("确定要删除该角色吗！", "提示", {
        confirmText: "确定",
        cancelText: "取消",
        type: "warning",
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(`roles/${role.id}`);
          if (res.meta.status !== 200) {
            return this.$message.error("删除失败！");
          }
          this.getRolesList();
          this.$message.success("删除成功！");
        })
        .catch(() => {
          this.$message.info("已取消删除！");
        });
    },
    // 分配权限
    async allotRights(){
      const key = [...this.$refs.treeRef.getCheckedKeys(),...this.$refs.treeRef.getHalfCheckedKeys()];
      // console.log(key);
      const idStr = key.join(',');
      // console.log(idStr);
      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids: idStr});
      if(res.meta.status !== 200){
        return this.$message.error('分配权限失败！');
      }
      this.$message.success('分配权限成功！');
      this.getRolesList();
      this.rightDialogVisible = false
    }
  },
};
</script>
<style lang="less" scoped>
.el-tag {
  margin: 6px;
}
.vcenter {
  display: flex;
  align-items: center;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.bdtop {
  border-top: 1px solid #eee;
}
</style>