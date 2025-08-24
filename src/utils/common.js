import { getUserInfo } from "../api/user";
import { requireLogin } from "./request";

const storageKey = "drawing_draft";

export function saveDrawingDraft(obj) {
  let payload = uni.getStorageSync(storageKey);
  if (payload) {
    payload = JSON.parse(payload);
  } else {
    payload = {};
  }
  console.log(payload, obj);
  for (const key in obj) {
    payload[key] = obj[key];
  }
  payload = JSON.stringify(payload);
  uni.setStorageSync(storageKey, payload);
}

export function getDrawingDraft(key) {
  let payload = uni.getStorageSync(storageKey);
  if (payload) {
    payload = JSON.parse(payload);
  } else {
    payload = {};
  }
  if (key) {
    return payload[key] || null;
  }
  return payload;
}
export const goToLogin = () => {
  uni.navigateTo({
    url: "/pages/login/login",
  });
};
export async function checkLogin(loginParam) {
  const token = uni.getStorageSync("token");
  let res;
  if (token) {
    res = await getUserInfo(loginParam);
  } else {
    requireLogin(loginParam);
  }
  return res && res.code == 20000;
}

// 保存图片到本地相册
export async function saveImages(images) {
  const promises = images.map((image) => {
    const res = uni.getSystemInfoSync() || {};
    const { osName } = res;
    if (osName == "ios") {
      // #ifdef MP-WEIXIN
      return new Promise((resolve, reject) => {
        uni.downloadFile({
          url: image,
          success(res) {
            if (res.statusCode === 200) {
              uni.saveImageToPhotosAlbum({
                filePath: res.tempFilePath,
                success() {
                  resolve();
                },
                fail(error) {
                  reject(error);
                },
              });
            } else {
              console.log("下载失败", res);
              reject(new Error("下载失败"));
            }
          },
          fail(error) {
            reject(error);
          },
        });
      });
      // #endif
    }
    // 微信小程序安卓端保存图片兼容处理
    return new Promise((resolve, reject) => {
      uni.getImageInfo({
        src: image,
        success: function () {
          // filePath = wx.env.USER_DATA_PATH + "/" + new Date().valueOf() + '.' + e.type;
          let filePath =
            wx.env.USER_DATA_PATH + "/" + new Date().valueOf() + ".png";
          console.log(filePath, "filepath");
          uni.downloadFile({
            url: image,
            filePath: filePath,
            success(res) {
              // const filePath = res.tempFilePath + "file.png"
              console.log(filePath);
              if (res.statusCode === 200) {
                uni.saveImageToPhotosAlbum({
                  filePath: filePath,
                  success() {
                    resolve();
                  },
                  fail(error) {
                    reject(error);
                  },
                });
              } else {
                console.log("下载失败");
                reject(new Error("下载失败"));
              }
            },
            fail(error) {
              console.log("下载失败 fail: ", error);
              reject(error);
            },
          });
        },
        fail(error) {
          console.log("下载失败 fail: ", error);
          reject(error);
        },
      });
    });
  });

  try {
    await Promise.all(promises);
    uni.showToast({
      title: "保存成功",
      icon: "success",
    });
  } catch (error) {
    console.log("保存失败", error);
    uni.showToast({
      title: "保存失败",
      icon: "none",
      duration: 2000,
    });
  }
}

// 请求授权然后下载保存图片
export function requestAuthThenSaveImages(images) {
  // 请求用户授权访问相册
  let scope = "scope.writePhotosAlbum";
  // #ifdef MP-TOUTIAO
  scope = "scope.album";
  // #endif

  return new Promise((resolve, reject) => {
    uni.authorize({
      scope: scope,
      async success() {
        console.log("授权成功");
        uni.showLoading({
          title: "保存中，请稍候",
        });
        await saveImages(images);
      },
      fail(error) {
        console.log("授权失败", error);
        uni.hideLoading();
        uni.showToast({
          icon: "error",
          title: "请授权访问相册",
        });
        reject("fail");
        // 在授权失败时可以给出相应的提示或处理逻辑
      },
    });
  });
}

export const setTopNavBar2DarkTheme = () => {
  uni.setNavigationBarColor({
    frontColor: "#ffffff",
    backgroundColor: "#111111",
  });
};

export const getMediumFontWeight = (osName) => {
  if (osName == "android") {
    return {
      "font-weight": 700,
    };
  }
  return {};
};

// 防止处理多次点击
export function debounceClick(fn, delay = 1000) {
  let isAlreadyClick = false;
  return function () {
    if (isAlreadyClick) return;
    fn.apply(this, arguments);
    isAlreadyClick = true;
    setTimeout(() => {
      isAlreadyClick = false;
    }, delay);
  };
}

export const replaceDomain = (url, newDomain) => {
  if (newDomain.startsWith("http://") || newDomain.startsWith("https://")) {
    return url.replace(/https?:\/\/[^/]+/, newDomain);
  } else {
    return url.replace(/(https?:\/\/)[^/]+/, "$1" + newDomain);
  }
};

/**
 * @description 格式化时间
 * @param {String|Number} dateTime 需要格式化的时间戳
 * @param {String} fmt 格式化规则 yyyy:mm:dd|yyyy:mm|yyyy年mm月dd日|yyyy年mm月dd日 hh时MM分等,可自定义组合 默认yyyy-mm-dd
 * @returns {string} 返回格式化后的字符串
 */
export function timeFormat(dateTime = null, formatStr = "yyyy-mm-dd") {
  let date;
  // 若传入时间为假值，则取当前时间
  if (!dateTime) {
    date = new Date();
  }
  // 若为unix秒时间戳，则转为毫秒时间戳（逻辑有点奇怪，但不敢改，以保证历史兼容）
  else if (/^\d{10}$/.test(dateTime?.toString().trim())) {
    date = new Date(dateTime * 1000);
  }
  // 若用户传入字符串格式时间戳，new Date无法解析，需做兼容
  else if (typeof dateTime === "string" && /^\d+$/.test(dateTime.trim())) {
    date = new Date(Number(dateTime));
  }
  // 处理平台性差异，在Safari/Webkit中，new Date仅支持/作为分割符的字符串时间
  // 处理 '2022-07-10 01:02:03'，跳过 '2022-07-10T01:02:03'
  else if (
    typeof dateTime === "string" &&
    dateTime.includes("-") &&
    !dateTime.includes("T")
  ) {
    date = new Date(dateTime.replace(/-/g, "/"));
  }
  // 其他都认为符合 RFC 2822 规范
  else {
    date = new Date(dateTime);
  }

  const timeSource = {
    y: date.getFullYear().toString(), // 年
    m: (date.getMonth() + 1).toString().padStart(2, "0"), // 月
    d: date.getDate().toString().padStart(2, "0"), // 日
    h: date.getHours().toString().padStart(2, "0"), // 时
    M: date.getMinutes().toString().padStart(2, "0"), // 分
    s: date.getSeconds().toString().padStart(2, "0"), // 秒
    // 有其他格式化字符需求可以继续添加，必须转化成字符串
  };

  for (const key in timeSource) {
    const [ret] = new RegExp(`${key}+`).exec(formatStr) || [];
    if (ret) {
      // 年可能只需展示两位
      const beginIndex = key === "y" && ret.length === 2 ? 2 : 0;
      formatStr = formatStr.replace(ret, timeSource[key].slice(beginIndex));
    }
  }

  return formatStr;
}
