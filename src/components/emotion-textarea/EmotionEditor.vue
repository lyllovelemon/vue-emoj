<template>
  <div class="wx-ste">
    <div class="ql-editor ql-blank"
         ref="myEditor"
         contentEditable="true"
         :style="{height:editorHeight+'px',fontSize:editorFontSize+'px'}"
         @blur="getServerText"
         data-placeholder="这里输入内容!"></div>
  </div>
</template>

<script>
  import EmotionPanel from './EmotionPanel.vue';
  import Emotion from '../emoji/emotion.vue';
  import emoji from '../emoji/index';
  const ImgReg = new RegExp('<img[^>]*>', 'g');
  const TitleReg = new RegExp(new RegExp('\\[(.*)\\]'));

  export default {
    props: {
      store: {
        type: Object
      },
      editorHeight: {
        type: Number,
        default: 100
      },
      editorFontSize: {
        type: Number,
        default: 14
      },
      writeHandler: {
        type: Function,
        default: null
      }
    },
    components: {
      EmotionPanel,
      Emotion
    },
    watch: {
      store(newVal) {
        this.recoveryEnterHtml(newVal.value);
      }
    },
    data() {
      return {
        MAX_LENGTH: 600,
        leftInput: 600,
        editor: null,
        savedRange: null,
        doc: null,
        win: null,
        text: !!this.store ? this.store.value : '',
        err: null
      };
    },
    methods: {
      /**
       * 插入emoji图片
       * @param img
       */
      insertEmoji(img) {
        this.win.focus();
        this.setCaretPosition();
        this.doc.execCommand('insertHTML', '', img);
        this.getCaretCharacterOffsetWithin();
      },
      setCaretPosition() {
        let sel;
        if (this.savedRange != null) {
          sel = this.win.getSelection();
          if (sel.rangeCount > 0) sel.removeAllRanges();
          sel.addRange(this.savedRange);
        } else if ((sel = this.doc.selection) && sel.type != 'Control') {
          this.win.getSelection().addRange(this.savedRange);
        }
      },
      getCaretCharacterOffsetWithin() {
        let sel;
        if (typeof this.win.getSelection !== 'undefined') {
          sel = this.win.getSelection();
          if (sel.rangeCount > 0) {
            let range = this.win.getSelection().getRangeAt(0);
            let preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(this.editor);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            this.savedRange = range;
          }
        } else if ((sel = this.doc.selection) && sel.type != 'Control') {
          let textRange = sel.createRange();
          let preCaretTextRange = this.doc.body.createTextRange();
          preCaretTextRange.moveToElementText(this.editor);
          preCaretTextRange.setEndPoint('EndToEnd', textRange);
          this.savedRange = textRange;
        }
        this.tryStore();
      },

      setClick(ev) {
        this.getCaretCharacterOffsetWithin();
      },

      getMyEditor() {
        return this.$refs.myEditor;
      },

      //还原文本，到页面
      recoveryEnterHtml(text) {
        this.editor.innerHTML = emoji.recoveryEmojiTextToHtml(text);
        if (text != '') {
          this.editor.className = 'ql-editor';
        } else {
          this.editor.className = 'ql-editor ql-blank';
        }
      },

      tryStore(slient) {
        const cache = this.getMyEditor().innerHTML.replace(ImgReg, function(img) {
          const match = img.match(TitleReg);
          if (!!match && !!match[0]) {
            return match[0];
          }
          return '';
        });
        this.leftInput = this.MAX_LENGTH - cache.length;
        if (!slient && !!this.writeHandler) {
          this.writeHandler(cache);
        }
        return cache;
      },

      getServerText() {
        return this.tryStore();
      },

      empty() {
        return (this.getMyEditor().innerHTML = '');
      },

      getLocalText() {
        return this.getMyEditor().innerHTML;
      },
      setLocalText(value) {
        this.win.focus();
        this.setCaretPosition();
        this.doc.execCommand('insertHTML', '', value);
        this.getCaretCharacterOffsetWithin();
      }
    },
    mounted: function() {
      let ifr = this.getMyEditor();
      this.editor = ifr;
      this.doc = ifr.ownerDocument || ifr.document;
      this.win = this.doc.defaultView || this.doc.parentWindow;
      //输入记录 倒灌 列表框
      this.recoveryEnterHtml(this.text);
      ifr.addEventListener('click', this.setClick);
      //绑定输入事件
      ifr.oninput = () => {
        if (this.editor.innerHTML != '') {
          this.editor.className = 'ql-editor';
        } else {
          this.editor.className = 'ql-editor ql-blank';
        }
        this.getCaretCharacterOffsetWithin();
      };
    }
  };
</script>

<style lang="less">
  .wx-emoji-sharp{
    vertical-align: middle;
    width: 20px;
    height: 20px;
    background: transparent url(https://res.wx.qq.com/mpres/en_US/htmledition/pages/modules/emoji_panel/icon_emotion_panel.2x.png) no-repeat 0 0;
    background-size: 20px auto;
  }
  .wx-ste {
    position: relative;
    border-top: 1px solid #E4E8EB;
    .ql-editor {
      padding: 14px 20px;
      outline: 0;
      word-wrap: break-word;
      -webkit-hyphens: auto;
      -ms-hyphens: auto;
      hyphens: auto;
      background-color: #FFFFFF;
      overflow-y: auto;
    }
    .ql-editor.ql-blank::before {
      color: rgba(0, 0, 0, 0.6);
      content: attr(data-placeholder);
      left: 15px;
      pointer-events: none;
      position: absolute;
      right: 15px;
    }
  }

</style>
