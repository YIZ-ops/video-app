// 视频信息页
const app = getApp();

// 视频工具类
const videoUtil = require('../../utils/videoUtils.js');

Page({
    data: {
        cover: "cover", // 对视频进行拉伸
        videoId: "", // 视频id
        src: "", // 视频播放地址
        videoInfo: {}, // 视频信息
        userLikeVideo: false, // 用户视频喜欢该视频
    },
    // 视频播放组件
    videoCtx: {},
    // 页面加载
    onLoad: function (params) {
        const that = this;
        // 创建视频播放组件
        that.videoCtx = wx.createVideoContext('myVideo', that);
        // 获取上一个页面传入的参数
        const videoInfo = JSON.parse(params.videoInfo);
        const height = videoInfo.videoHeight;
        const width = videoInfo.videoWidth;
        let cover = "cover";
        // 当是横屏的视频，不对画面进行裁剪
        if (width >= height) {
            cover = "";
        }
        that.setData({
            videoId: videoInfo.id,
            src: app.serverUrl + videoInfo.videoPath,
            videoInfo: videoInfo,
            cover: cover
        });
        const serverUrl = app.serverUrl;
        // 获取全局用户信息
        const userInfo = app.getGlobalUserInfo();
        // 登陆用户id
        let loginUserId = "";
        if (userInfo) {
            loginUserId = userInfo.id;
        }
        // 查询用户是否喜欢该视频
        wx.request({
            url: `${serverUrl}ware/users/queryIsLike?loginUserId=${loginUserId}&videoId=${videoInfo.id}`,
            method: "POST",
            success(res) {
                console.log(res.data);
                // 用户是否喜欢该视频
                const userLikeVideo = res.data.data;
                that.setData({
                    serverUrl: serverUrl,
                    userLikeVideo: userLikeVideo
                });
            }
        });
    },
    // 页面展示时
    onShow: function () {
        const that = this;
        // 启动视频播放
        that.videoCtx.play();
    },
    // 页面隐藏时
    onHide: function () {
        const that = this;
        // 暂停视频播放
        that.videoCtx.pause();
    },
    // 展示搜索页面
    showSearch: function () {
        // 跳转到搜索视频页面
        wx.navigateTo({
            url: '../searchVideo/searchVideo',
        })
    },
    // 跳转到首页
    showIndex: function () {
        wx.redirectTo({
            url: '../index/index'
        })
    },
    // 显示我的页面
    showMine: function () {
        // 获取全局用户信息
        const userInfo = app.getGlobalUserInfo();

        if (!userInfo) {
            // 未登录时跳转到登录页
            wx.navigateTo({
                url: '../userLogin/login'
            });
        } else {
            // 已登录时，跳转到我的页面
            wx.navigateTo({
                url: '../mine/mine'
            })
        }
    },
    // 是否给该视频点赞
    likeVideoOrNot: function () {
        const that = this;
        // 视频信息
        const videoInfo = that.data.videoInfo;
        // 获取全局用户信息
        const userInfo = app.getGlobalUserInfo();
        if (!userInfo) {
            // 未登录时跳转到登录页
            wx.navigateTo({
                url: '../userLogin/login'
            });
        } else {
            // 已登录时，判断用户是否点赞并进行数据更新
           const userLikeVideo = that.data.userLikeVideo;
           // 将请求的地址
           let url = `ware/videos/userLike?userId=${userInfo.id}&videoId=${videoInfo.id}`;
            if (userLikeVideo) {
                url = `ware/videos/userUnLike?userId=${userInfo.id}&videoId=${videoInfo.id}`;
            }

            const serverUrl = app.serverUrl;

            // 展示提示框
            wx.showLoading({
                title: '请等待…'
            });

            // 网络请求
            wx.request({
                url: serverUrl + url,
                method: "POST",
                header: {
                    'content-type': 'application/json', // 默认值
                    'headerUserId': userInfo.id,
                    'headerUserToken': userInfo.userToken
                },
                success(res) {
                    // 隐藏提示框
                    wx.hideLoading();
                    that.setData({
                        userLikeVideo: !userLikeVideo
                    });
                }
            })
        }
    },
    // 分享视频
    shareMe: function () {
        const that = this;
        // 获取全局用户信息
        const userInfo = app.getGlobalUserInfo();
        // 展示选项列表
        wx.showActionSheet({
            itemList: ['下载到本地', '分享到朋友圈', '分享到QQ空间', '分享到微博'],
            success(res) {
                console.log(res.tapIndex);

                // 用户点赞选项的下标
                const tapIndex = res.tapIndex;

                if (tapIndex === 0) {
                    // 下载
                    wx.showLoading({
                        title: '下载中…'
                    });

                    // 下载文件
                    wx.downloadFile({
                        url: app.serverUrl + that.data.videoInfo.videoPath,
                        success(res) {
                            // 只要服务器有数据响应，就会把响应内容写入文件，并进行success回调
                            if (res.statusCode === 200) {
                                console.log(res.tempFilePath);

                                // 保存视频到相册
                                wx.saveVideoToPhotosAlbum({
                                    filePath: res.tempFilePath,
                                    success(errMsg) {
                                        console.log(errMsg);
                                        // 隐藏进度加载条
                                        wx.hideLoading();
                                    }
                                })
                            }
                        }
                    })
                } else {
                    // 其他选项
                    wx.showToast({
                        title: '官方暂未开放…'
                    })
                }
            }
        })
    },
    // 分享App消息
    onShareAppMessage: function (res) {
        var that = this;
        var videoInfo = that.data.videoInfo;

        return {
            title: '短视频内容分析',
            path: "pages/videoinfo/videoinfo?videoInfo=" + JSON.stringify(videoInfo)
        }
    },
    // 滑动到页面底部
    onReachBottom: function () {
        const that = this;
        // 当前页数
        const currentPage = that.data.commentsPage;
        // 总页数
        const totalPage = that.data.commentsTotalPage;
        // 到达最后一页
        if (currentPage === totalPage) {
            return;
        }
        // 请求下一页的数据
        const page = currentPage + 1;
        that.getCommentsList(page);
    }
});
