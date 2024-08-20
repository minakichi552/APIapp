const app = new Vue({
  el: '#app',
  vuetify: new Vuetify(),
  data() {
    return {
      //ホームボタン要素
      links: [
        'Home',
        'Search',
        'Category',
        'Cart',
      ],
      showSearchBar: false, //検索バー初期：false
      dataList: [], //商品メニュー表示用配列箱
      detailsDialog: false, //商品詳細オーバレイ初期：false
      selectedItem: {},
      selectedSize: '', 
      num: 1, 
      sizes: ['S', 'M', 'L'], 
      cartDialog: false,  //カートオーバレイ初期：false
      cartItems: [],  //カート表示用配列箱
      user_id: sessionStorage.getItem('user_id'),   //user_id初期値設定⇒ログインセッションから取得
      userName: sessionStorage.getItem('userName'), //userName初期値設定⇒ログインセッションから取得

    };
  },
  mounted() {
    //ページ読み込み時に呼び出し
    this.readData();
  },
  methods: {
    //検索バーの発生
    toggleSearchBar() {
      this.showSearchBar = !this.showSearchBar;
    },
    //カートの表示trueに変更
    async showCartDialog() {
      this.cartDialog = true;
      await this.loadCartItems();
    },
    //カート内の情報取得・整理
    async loadCartItems() {
      console.log("loadCartItems called"); 
      try {
        // user_idを元にCartTableから情報取得
        const cartResponse = await fetch(`https://m3h-minaki-apishop.azurewebsites.net/api/SELECT?function=GetCartByUserId&user_id=${this.user_id}`);
        const cartData = await cartResponse.json();
        console.log("Cart data:", cartData); //デバック用コンソール表示

        // item_idを元にItemTableから情報取得
        const itemResponses = await Promise.all(cartData.List.map(item => 
        fetch(`https://m3h-minaki-apishop.azurewebsites.net/api/SELECT?function=GetItemById&item_id=${item.ItemId}`)
        ));
        const itemsData = await Promise.all(itemResponses.map(res => res.json()));
        console.log("Items data:", itemsData); //デバック用コンソール表示

        //CartTable.ItemTableから取得した情報を一つの配列へまとめる
        this.cartItems = cartData.List.map(cartItem => {
          const item = itemsData.find(i => i.List && i.List[0] && i.List[0].ItemId === cartItem.ItemId);
          if (!item || !item.List || item.List.length === 0) {
            console.warn(`Item not found for cartItem ID: ${cartItem.ItemId}`);//型等の相違による警告
            return cartItem;
          }
        return {
    ...cartItem,
    ...item.List[0],
  };
});
    console.log("Final cart items:", this.cartItems); //一つの配列格納デバック用コンソール表示
    //失敗したときの枝分かれ
  } catch (error) {
    console.error('Error loading cart items:', error); 
  }
},
    
    
    //商品メニュー情報の取得
    readData: async function() {
      try {
        const response = await axios.get('https://m3h-minaki-apishop.azurewebsites.net/api/SELECT?function=GetItemTable');
        console.log(response.data);
        this.dataList = response.data.List;
      } catch (error) {
        console.error("データ取得エラー:", error);
      }
    },
    
    //商品詳細オーバレイ用
    showDetails(item) {
      this.selectedItem = item;
      this.selectedSize = ''; 
      this.num = 1; 
      this.detailsDialog = true;
    },
    
    //カートに追加用
    async addToCart() {
      const param = {
        //変数が合わないときコンソールのログを見ると便利
        Table: 'CartTable', // 挿入先のテーブルを指定
        UserID: this.user_id, // ユーザーID
        ItemID: this.selectedItem.ItemId,//item_id
        Size: this.selectedSize,//size
        Num: this.num//個数
      };
      // きちんと格納がなされているか確認用
      console.log("送信するパラメーター:", param);
      try {
        const response = await axios.post('https://m3h-minaki-apishop.azurewebsites.net/api/INSERT', param);

        // APIレスポンスをコンソールに表示
        console.log("APIレスポンス:", response.data);
        this.detailsDialog = false;  //カートに追加時点でオーバレイを閉じるfalse
      } catch (error) {
        // エラーの詳細をコンソール表示：開発用だが残しておく
        console.error("カート追加エラー:", error.message);
        if (error.response) {
          console.error("レスポンスエラー:", error.response.data);
        } else if (error.request) {
          console.error("リクエストエラー:", error.request);
        } else {
          console.error("設定エラー:", error.message);
        }
      }
    },

    // カートアイテムを削除するメソッド
  async removeFromCart(CartId) {
    console.log(`Deleting cart item with cart_id: ${CartId}`); // cart_id の値をコンソールに表示
    try {
      const response = await axios.get(`https://m3h-minaki-apishop.azurewebsites.net/api/DELETE?cart_id=${CartId}`);
      console.log('削除成功:', response.data);

      // 削除後にカートアイテムを再取得して更新する
      await this.loadCartItems();
    } catch (error) {
      console.error('削除エラー:', error.message);
      if (error.response) {
        console.error('レスポンスエラー:', error.response.data);
      } else if (error.request) {
        console.error('リクエストエラー:', error.request);
      } else {
        console.error('設定エラー:', error.message);
      }
    }
  },
    
    //ページ遷移時に役立つ用
    goToNextPage() {
      window.location.href = 'page1.html';
    },
  },
});