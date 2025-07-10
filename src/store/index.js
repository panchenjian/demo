import { createStore } from "vuex";
import { getGroupList } from "../api/swapTemplate";
import { getUserInfo } from "../api/user";
import { getAppConfig } from "../api";

const state = {
  portrait: [
						  // {"id":1,"name":"全部",templates:[{target_image:'',name:'萌小人'},{target_image:'',name:'axx'},{target_image:'',name:'axx'},{target_image:'',name:'axx'},{target_image:'',name:'axx'},{target_image:'',name:'a'}]},
						  // {"id":2,"name":"人物"},
						  // {"id":3,"name":"萌宠"}
				],
	addPortrait:[],
  tempUuid:'',//当前选择的模板uuid
  tempTitleList:[],//标题分类
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
  setTempUuid(state, data) {
    state.tempUuid = data;
  },
  setTempTitleList(state, data) {
    state.tempTitleList = data;
  },
  setTempTitleListByUuid(state, data) {
    state.tempTitleList.forEach(x=>{
		if(x.uuid===data.uuid){
			if(!x.list){
				x.list=[];
			}
			x.list=x.list.concat(data.data);
			if(!x.curPage){
				x.curPage=1;
			}else{
				x.curPage++;
			}
		}
		return x;
	});
	console.log(state.tempTitleList)
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
  let fetchPromise;
  if("portrait"===getter){
		let t=getter && state['tempTitleList'];
		let one=t.find(x=>x.uuid===state.tempUuid);
		debugger;
	  fetchPromise =one?.curPage
	      ? Promise.resolve(state['tempTitleList'])
	      : null;
  }else{
	  fetchPromise =
	    getter && state[getter] && state[getter].length > 0
	      ? Promise.resolve(state[getter])
	      : null;
  }
  

  if (fetchPromise) {
    return fetchPromise;
  }

  return fetchFunction().then(({ mutationName, data,uuid }) => {
    commit(mutationName, data);
	// if(uuid){
		commit('setTempTitleListByUuid',{uuid,data:data})
	// }
    return data;
  });
};

const actions = {
  fetchPortrait({ commit },{category_uuid,page}) {
	  console.log('点击uuid',category_uuid);
    return createFetchAction(commit, this.state, page&&page>1?"addPortrait":"portrait", () =>
      getGroupList({
        page: page||1,
		size:20,
		category_uuid:category_uuid||this.state.tempUuid
      }).then((res) => {
        if (res.code === 20000) {
          return {
            mutationName: "setPortrait",
            data: res.data?.items,
			uuid:category_uuid,
			page:page
          };
        }else{
			return {
				mutationName: "setPortrait",
				data: [],
			}
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
        if (res.code === 20000) {
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
