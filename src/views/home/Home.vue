<template>
  <el-container>
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="@/assets/shop.png" alt />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="loginOut">登出</el-button>
    </el-header>
    <!-- 页面容器 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏菜单折叠展开切换 -->
        <div class="toggle-button" @click="isCollapse=!isCollapse">|||</div>
        <!-- 侧边栏菜单 -->
        <el-menu
          :default-active="activePath"
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
        >
          <!-- 一级菜单 -->
          <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveMenuState('/'+subItem.path)"
            >
              <i class="el-icon-menu"></i>
              <span>{{ subItem.authName }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 页面主体 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      // 左侧菜单列表
      menuList: [],
      // 是否折叠左侧菜单
      isCollapse: false,
      // 当前激活菜单路径
      activePath: "",
      // 图标样式对象
      iconObj: {
        125: "iconfont icon-user",
        103: "iconfont icon-tijikongjian",
        101: "iconfont icon-shangpin",
        102: "iconfont icon-danju",
        145: "iconfont icon-baobiao",
      },
    };
  },
  created() {
    this.getMenuList();
    this.activePath = sessionStorage.getItem("activePath");
  },
  methods: {
    // 获取左侧菜单列表
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      // console.log(res);
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.status);
      }
      this.menuList = res.data;
    },
    // 保存当前激活菜单路径
    saveMenuState(activePath) {
      sessionStorage.setItem("activePath", activePath);
      this.activePath = activePath;
    },
    // 退出
    loginOut() {
      sessionStorage.clear();
      this.$router.push("/login");
    },
  },
};
</script>
<style lang='less' scoped>
.el-container {
  height: 100%;
}
.el-header {
  background: #373d41;
  display: flex;
  justify-content: space-between;
  align-items: center;
  div {
    display: flex;
    align-items: center;
    img {
      width: 40px;
      margin-right: 20px;
      margin-left: 10px;
    }
    span {
      color: white;
      font-size: 20px;
    }
  }
}
.el-aside {
  background: #333744;
  .el-menu {
    border-right: 0;
    .iconfont {
      margin-right: 10px;
    }
  }
  .toggle-button {
    background: #4a5064;
    font-size: 15px;
    line-height: 25px;
    text-align: center;
    color: #fff;
    letter-spacing: 0.2rem;
    cursor: pointer;
  }
}
.el-main {
  background: #eaedf1;
}
</style>