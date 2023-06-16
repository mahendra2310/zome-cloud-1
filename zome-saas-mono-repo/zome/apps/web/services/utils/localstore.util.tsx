const localStoreUtil = {
  store_data: (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  },

  get_data: (key) => {
    const item =
      typeof window !== 'undefined' ? localStorage.getItem(key) : null;

    if (!item) return;
    return JSON.parse(item);
  },

  remove_data: (key) => {
    localStorage.removeItem(key);
    return true;
  },

  remove_all: () => {
    localStorage.clear();
    return true;
  },
};

export default localStoreUtil;
