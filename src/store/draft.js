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
  Draft: class {
    /**
     * 用户作图草稿
     * @param {DraftType.Template} template 用户选择模板
     */
    constructor({ template }) {
      this.template = template;
    }
  },
};

export const DraftStore = {
  getDraft(store) {
    return store.state.draft;
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
      template: null,
    });
  },
};
