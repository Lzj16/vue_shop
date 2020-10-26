<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="@/assets/logo.png" alt />
      </div>
      <!-- 标题 -->
      <div class="title">Vue电商后台管理系统</div>
      <!-- 登陆表单 -->
      <el-form
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
        class="login_form"
      >
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user" placeholder="请输入用户名" ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item class="btns">
            <el-button type="primary" @click="login">登陆</el-button>
            <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
    data(){
        return{
            // 表单的数据绑定对象
            loginForm:{
                username:'admin',
                passowrd:''
            },
            // 表单校验规则
            loginFormRules:{
                username:[
                    { required: true, message: "请输入用户名", trigger: "blur"},
                    { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur"}
                ],
                password:[
                    { required: true, message: "请输入密码", trigger: "blur"},
                    { min: 6, max: 12, message: "长度在 6 到 12 个字符", trigger: "blur"}
                ]
            }
        }
    },
    methods:{
        login(){
            // 判断表单校验是否成功
            this.$refs.loginFormRef.validate( async valid => {
                if(!valid){
                    return;
                }

                // 发送请求判断是否登陆成功
                const {data:res} = await this.$http.post('login',this.loginForm);
                if(res.meta.status !== 200){
                    return this.$message.error('登陆失败');
                }

                this.$message.success('登陆成功');

                // 将token保存在sessionStorage里
                sessionStorage.setItem('token',res.data.token);

                // 指定路由跳转页面
                this.$router.push('/home')
            })
        },
        reset(){
            // 重置表单
            this.$refs.loginFormRef.resetFields();
        }
    }
};
</script>
<style lang='less' scoped>
.login_container {
  background: #2b5b6b;
  height: 100%;
}
.login_box {
  width: 450px;
  height: 350px;
  background: #fff;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    width: 130px;
    height: 130px;
    border: 1px, solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #eee;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: #eee;
    }
  }

  .title {
    position: absolute;
    top: 100px;
    left: 50%;
    transform: translate(-50%);
    font-size: 20px;
    font-weight: bold;
  }

  .login_form{
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0 20px;
      box-sizing: border-box;
      .btns{
          text-align: center;
      }
  }
}
</style>