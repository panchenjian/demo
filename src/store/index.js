import { createStore } from "vuex";
import { getGroupList } from "../api/swapTemplate";
import { getUserInfo } from "../api/user";
import { getAppConfig } from "../api";

const state = {
  portrait: null,
  swap: null,
  browseringGroupDetail: null,
  /**
   * @type {AblumType.Ablum} 当前查看的相册详情
   */
  browseringAlbumDetail: {},
  /**
   * @type {DraftType.Draft} 用户作图草稿
   */
  draft: {},
  userInfo: null,
  appConfig: null,
};
const mutations = {
  // 不要直接调用这个方法，应该调用 DraftStore.setXXX 等方法。保证数据结构的一致性
  updateDraft(state, data) {
    let payload = state.draft;
    for (const key in data) {
      payload[key] = data[key];
    }
    // console.log("updated draft", JSON.stringify(payload));
  },
  // 不要直接调用这个方法，应该调用 AblumStore.setXXX 等方法。保证数据结构的一致性
  updateBrowseringAlbumDetail(state, data) {
    let payload = state.browseringAlbumDetail;
    for (const key in data) {
      payload[key] = data[key];
    }
    // console.log("updated ablum detail", state.browseringAlbumDetail);
  },
  setBrowseringGroupDetail(state, data) {
    state.browseringGroupDetail = data;
  },
  setPortrait(state, data) {
    state.portrait = data;
  },
  setSwap(state, data) {
    state.swap = data;
  },
  setUserInfo(state, data) {
    state.userInfo = data;
  },
  setAppConfig(state, data) {
    state.appConfig = data;
  },
};
const createFetchAction = (commit, state, getter, fetchFunction) => {
  const fetchPromise =
    getter && state[getter] && state[getter].length > 0
      ? Promise.resolve(state[getter])
      : null;

  if (fetchPromise) {
    return fetchPromise;
  }

  return fetchFunction().then(({ mutationName, data }) => {
    commit(mutationName, data);
    return data;
  });
};

const actions = {
  fetchPortrait({ commit }) {
    return createFetchAction(commit, this.state, "portrait", () =>
      getGroupList({
        page_id: 1,
      }).then((res) => {
        if (res.code === 1) {
          return {
            mutationName: "setPortrait",
            data: res.data?.groupList,
          };
        }
      })
    );
  },
  fetchSwap({ commit }) {
    return createFetchAction(commit, this.state, "swap", () =>
      getGroupList({
        page_id: 2,
      }).then((res) => {
        if (res.code === 1) {
          return {
            mutationName: "setSwap",
            data: res.data?.groupList,
          };
        }
      })
    );
  },
  fetchUserInfo({ commit }) {
    return createFetchAction(commit, this.state, "userInfo", () =>
      getUserInfo().then((res) => {
        if (res.code === 1) {
          return {
            mutationName: "setUserInfo",
            data: res.data,
          };
        }
        return null;
      })
    );
  },
  fetchAppConfig({ commit }) {
    return createFetchAction(commit, this.state, "appConfig", () =>
      getAppConfig().then((res) => {
        if (res.code === 1) {
          return {
            mutationName: "setAppConfig",
            data: res.data,
          };
        }
        return null;
      })
    );
  },
};

const store = createStore({
  actions,
  mutations,
  state,
});

export default store;
