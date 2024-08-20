new Vue({
      el: '#app',
      vuetify: new Vuetify(),
      data() {
        return {
          userName: '',
          password: '',
          errorMessage: ''
        };
      },
      methods: {
        async handleLogin() {
  try {
    const response = await axios.get('https://m3h-minaki-apishop.azurewebsites.net/api/SELECT?function=GetUserTable');
    const users = response.data.List;

    // 入力されたユーザー名とパスワードを照合
    const user = users.find(user => user.UserName === this.userName && user.UserPassword === this.password);

    if (user) {
      // 正しい user_id と userName を保存する
      sessionStorage.setItem('user_id', user.UserId); // user_id を保存
      sessionStorage.setItem('userName', user.UserName); // userName を保存
      console.log("Saved user_id:", sessionStorage.getItem('user_id')); // デバッグ用
      console.log("Saved userName:", sessionStorage.getItem('userName')); // デバッグ用
      window.location.href = 'shopping.html';
      //window.location.href = 'https://codepen.io/minakichi552/pen/gONXaya?editors=1010'; // 特定のURLにリダイレクト
    } else {
      this.errorMessage = 'Invalid User Name or Password';
    }
  } catch (error) {
    this.errorMessage = 'Failed to login. Please try again later.';
    console.error('Login error:', error);
  }
},
      
      }
    });