// app.js
App({
  serverUrl: "http://localhost:8080/renren-fast/",
  userInfo: null,
  // 全局存储用户信息
  setGlobalUserInfo: function (user) {
    wx.setStorageSync('userInfo', user);
  },
  // 获取全局用户信息
  getGlobalUserInfo: function () {
    return wx.getStorageSync('userInfo');
  },
  onLaunch: function () {
    // 在小程序启动时检查用户信息
    const userInfo = this.getGlobalUserInfo();
    if (!userInfo) {
      // 如果不存在用户信息，则跳转到登录页
      wx.navigateTo({
        url: 'pages/userLogin/login',
      });
    }
  },
  // 举报原因数组
  reportReasonArray: [
    "色情低俗",
    "政治敏感",
    "涉嫌诈骗",
    "辱骂谩骂",
    "广告垃圾",
    "诱导分享",
    "引人不适",
    "过于暴力",
    "违法违纪",
    "其它原因"
  ],
})
