export const DraftType = {
  Template: class {
    /**
     * 用户选择的模板信息
     * @param id 模板ID
     * @param name 模板名称
     * @param target_image 模板封面图URL
     */
    constructor({ id, name, target_image }) {
      this.id = id;
      this.name = name;
      this.target_image = target_image;
    }
  },
  UserImage: class {
    /**
     * 用户上传图片信息
     * @param file_id 应用端文件ID
     * @param up_file_id 算法端文件ID
     * @param up_face_id 算法端人脸ID
     */
    constructor({ file_id, up_file_id, up_face_id }) {
      this.file_id = file_id;
      this.up_file_id = up_file_id;
      this.up_face_id = up_face_id;
    }
  },
  TemplateFaceMappingItem: class {
    /**
     * 人脸映射关系
     * @param up_file_id 上游目标文件ID
     * @param mapping 人脸映射关系。目标图人脸ID => 用户图人脸ID
     */
    constructor({ up_file_id, mapping }) {
      this.up_file_id = up_file_id;
      this.mapping = mapping;
    }
  },
  Draft: class {
    /**
     * 用户作图草稿
     * @param {Array<DraftType.Template>} template 用户选择模板
     * @param strategy_id 玩法策略ID
     * @param is_collection 合辑模板
     * @param random_candidate_cnt 合辑模板每一张模板随机选择子模版的数量
     * @param {DraftType.UserImage} user_image 用户上传的图片信息
     * @param {Array<DraftType.TemplateFaceMappingItem>} template_face_mapping 人脸映射关系数组
     */
    constructor({
      template,
      strategy_id,
      is_collection,
      random_candidate_cnt,
      user_image,
      template_face_mapping,
    }) {
      this.template = template;
      this.strategy_id = strategy_id;
      this.is_collection = is_collection;
      this.random_candidate_cnt = random_candidate_cnt;
      this.user_image = user_image;
      this.template_face_mapping = template_face_mapping;
    }
  },
};

export const DraftStore = {
  getDraft(store) {
    return store.state.draft;
  },
  /**
   * 设置用户上传的图片信息
   * @param {import('vuex').Store} store Vuex store 对象
   * @param {DraftType.UserImage} user_image 模板数组
   */
  setUserImage(store, user_image) {
    // 判断是否是 UserImage 实例
    if (!(user_image instanceof DraftType.UserImage)) {
      throw new Error(
        "The params [user_image] must be an instance of {DraftType.UserImage}."
      );
    }
    store.commit("updateDraft", {
      user_image,
    });
  },
  setTemplateFaceMapping(store, template_face_mapping) {
    // 校验每个元素类型
    const isValid = template_face_mapping.every(
      (item) => item instanceof DraftType.TemplateFaceMappingItem
    );

    if (!isValid) {
      throw new Error(
        "The param [template_face_mapping] contains invalid items. All items must be instances of {DraftType.TemplateFaceMappingItem}."
      );
    }

    store.commit("updateDraft", {
      template_face_mapping,
    });
  },
  resetTemplateFaceMapping(store) {
    store.commit("updateDraft", {
      template_face_mapping: null,
    });
  },
  resetUserImage(store) {
    store.commit("updateDraft", {
      user_image: null,
    });
  },
  getUserImage(store) {
    return store.state.draft.user_image;
  },
  setRandomCandidateCnt(store, random_candidate_cnt) {
    store.commit("updateDraft", {
      random_candidate_cnt,
    });
  },
  getRandomCandidateCnt(store) {
    return store.state.draft.random_candidate_cnt;
  },
  setIsCollection(store, is_collection) {
    store.commit("updateDraft", {
      is_collection,
    });
  },
  getIsCollection(store) {
    return store.state.draft.is_collection;
  },
  setStrategyId(store, strategy_id) {
    store.commit("updateDraft", {
      strategy_id,
    });
  },
  getStrategyId(store) {
    return store.state.draft.strategy_id;
  },
  /**
   * 设置用户已选的模板
   * @param {import('vuex').Store} store Vuex store 对象
   * @param {DraftType.Template} template 模板数组
   */
  setTemplate(store, template) {
    const isValid = template instanceof DraftType.Template;
    if (!isValid) {
      throw new Error(
        "The param [template] contains invalid items. All items must be instances of {DraftType.Template}."
      );
    }

    store.commit("updateDraft", {
      template,
    });
  },
  /**
   * 获取用户已选的模板
   * @param {import('vuex').Store} store Vuex store 对象
   * @returns {Array<DraftType.Template>} 模板数组
   */
  getTemplate(store) {
    return store.state.draft.template;
  },
  resetTemplate(store) {
    store.commit("updateDraft", {
      template: [],
    });
  },
};
