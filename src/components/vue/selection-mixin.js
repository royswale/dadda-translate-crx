import { _calcPosition } from '@/utils'
import { TR_SETTING_IS_DIRECTLY_KEY } from '@/utils/constant'

export default {
  computed: {
    buttonPositionStyle() {
      const { buttonX, buttonY } = this.position
      return {
        left: buttonX,
        top: buttonY
      }
    },

    panelPositionStyle() {
      const { panelX, panelY, isTop, maxHeight } = this.position

      return {
        left: panelX,
        maxHeight: maxHeight,
        [isTop ? 'top' : 'bottom']: panelY
      }
    },

    resultPanelVisible() {
      const { panelVisible, selection, translateLoaded } = this
      return translateLoaded && panelVisible
    }
  },

  data() {
    return {
      selection: '',
      panelVisible: false,
      translateLoaded: false,
      position: {
        panelX: 0,
        panelY: 0,
        buttonX: 0,
        buttonY: 0,
        maxHeight: 0,
        isTop: true
      },

      translationResult: Object.create(null)
    }
  },

  methods: {
    hidePanel() {
      this.translateLoaded = false
      this.panelVisible = false
    },

    async showPanel(text) {
      const { $root, $root: { count, translateDirectly, inExtension }, $storage } = this
      // 如果设置了直接翻译则直接显示结果面板
      this.panelVisible = inExtension ? true : count === 0 ? translateDirectly : await $storage.get(TR_SETTING_IS_DIRECTLY_KEY)
      this.translationResult = null
      this.translateLoaded = false

      chrome.runtime.sendMessage({ name: 'translate', text }, res => {
        this.translationResult = res
        this.translateLoaded = true
        this.$root.count = ++$root.count
      })
    },

    onMouseDown(e) {
      if (e.button === 0) {
        this.position = _calcPosition(e)

        const text = window
          .getSelection()
          .toString()
          .trim()

        this.selection = text

        if (text) {
          this.showPanel(text)
        }
      }
    }
  }
}
