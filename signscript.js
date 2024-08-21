new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data() {
    return {
      userName: '',
      password: '',
      confirmPassword: '',
      errorMessage: '',
      showSuccessOverlay: false // 成功オーバーレイの表示制御
    };
  },
  methods: {
    async handleRegister() {
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'パスワードが一致しません';
        return;
      }

      try {
        // 既存のユーザー名があるかどうかを確認
        const response = await axios.get('https://m3h-minaki-apishop.azurewebsites.net/api/SELECT?function=GetUserTable');
        const users = response.data.List; // 既にパースされているため、再度JSON.parseは不要

        const existingUser = users.find(user => user.UserName === this.userName);

        if (existingUser) {
          this.errorMessage = 'すでに存在するユーザ名です';
        } else {
          // ユーザー名が存在しない場合、新規登録を行う
          const param = {
            Table: 'UserTable',
            UserName: this.userName,
            UserPassword: this.password
          };

          await axios.post('https://m3h-minaki-apishop.azurewebsites.net/api/INSERT', param);
          this.errorMessage = '';
          this.showSuccessOverlay = true; // 成功オーバーレイを表示
          this.userName = '';
          this.password = '';
          this.confirmPassword = '';
        }
      } catch (error) {
        console.error('Error during registration:', error);
        this.errorMessage = '登録処理中にエラーが発生しました.';
      }
    },
    
    navigateToLogin() {
    // ログイン画面に戻る処理
      window.location.href = 'index.html';
    //window.location.href = 'https://codepen.io/minakichi552/pen/KKjQbXW?editors=1010'; // ログイン画面のURLに変更
    }
  }
});