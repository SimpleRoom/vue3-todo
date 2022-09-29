

const STORAGE_KEY = 'VUE3-TODO'
const Storage = {
  save: function (items) {
    return window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  },
  fetch: function () {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || '[]')
  },
  deletedThis: function (kk) {
    return window.sessionStorage.removeItem(kk)
  }
}

export { Storage }
