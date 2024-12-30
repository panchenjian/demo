export const AblumType = {
  ImageItem: class {
    /**
     * @param result_image 结果图
     * @param template_name 模板名称
     */
    constructor({ result_image, template_name }) {
      this.result_image = result_image;
      this.template_name = template_name;
    }
  },
  Ablum: class {
    /**
     * @param taskId 上传任务ID
     * @param previewImageIndex 预览图片索引
     * @param {Array<AblumType.ImageItem>} imageList 图片列表
     */
    constructor({ taskId, previewImageIndex, imageList }) {
      this.taskId = taskId;
      this.previewImageIndex = previewImageIndex;
      this.imageList = imageList;
    }
  },
};

export const AblumStore = {
  setTaskId(store, taskId) {
    store.commit("updateBrowseringAlbumDetail", {
      taskId,
    });
  },
  getTaskId(store) {
    return store.state.browseringAlbumDetail.taskId;
  },

  /**
   * 设置当前查看的相册的图片列表
   * @param {import('vuex').Store} store Vuex store 对象
   * @param {Array<AblumType.ImageItem>} imageList 图片列表
   */
  setImageList(store, imageList) {
    // 校验每个元素
    const isValid = imageList.every(
      (item) => item instanceof AblumType.ImageItem
    );

    if (!isValid) {
      throw new Error(
        "The param [imageList] contains invalid items. All items must be instances of {AblumType.ImageItem}."
      );
    }

    store.commit("updateBrowseringAlbumDetail", {
      imageList,
    });
  },
  /**
   * 获取当前查看的相册的图片列表
   * @param {import('vuex').Store} store Vuex store 对象
   * @returns {Array<AblumType.ImageItem>} 图片列表
   */
  getImageList(store) {
    return store.state.browseringAlbumDetail.imageList;
  },
  setPreviewImageIndex(store, previewImageIndex) {
    store.commit("updateBrowseringAlbumDetail", {
      previewImageIndex,
    });
  },
  getPreviewImageIndex(store) {
    return store.state.browseringAlbumDetail.previewImageIndex;
  },
};
