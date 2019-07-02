<template>
  <div class="wx-ste">
    <div class="ql-editor ql-blank"
         ref="myEditor"
         :contentEditable="editable"
         :data-placeholder="editable ? '这里输入内容!' : ''"
         :style="{height:editorHeight,fontSize:editorFontSize+'px'}"
         @blur="tryStore"
         data-placeholder="这里输入内容!"></div>
    <template v-if="editable">
      <p class="tip" v-if="leftInput>0">还可以输入<em>{{leftInput}}</em>字</p>
      <p class="tip" style="color: red;" v-else>超出字数限制</p>
    </template>
  </div>
</template>

<script>
  import EmotionPanel from './EmotionPanel.vue';
  import Emotion from '../emoji/emotion.vue';
  import emoji from '../emoji/index';
  const ImgReg = new RegExp('<img[^>]*>', 'g');
  const TitleReg = new RegExp(new RegExp('\\[(.*)\\]'));
  const TagReg = new RegExp('<[^>]*>[^<]*</[^>]*>', 'g');
  const TextReg = new RegExp('>([\\s|\\S]*)<', 'g');

  export default {
    props: {
      store: {
        type: Object
      },
      editorHeight: {
        type: String,
        default: '100px'
      },
      editorFontSize: {
        type: Number,
        default: 14
      },
      editable: {
        type: Boolean,
        default: true
      },
      writeHandler: {
        type: Function,
        default: null
      },
      maxLength: {
        type: Number,
        default: 500
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
        leftInput: 500,
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

      _safe(text) {
        return text
          .replace(TagReg, inner => {
            let m = inner.match(TextReg);
            if (!!m && m[0] && m[0].length > 2) {
              return '\n' + m[0].substr(1, m[0].length - 2);
            }
            return '';
          })
          .replace(new RegExp('&nbps;', 'g'), ' ');
      },
      filterSafeHtml(text) {
        text = text.replace(/\<br\>/g, '\n');
        text = text.replace(/&nbsp;/g, ' ');
        text = this._safe(text);
        if (TagReg.test(text)) {
          text = this._safe(text);
        }
        return text;
      },

      tryStore(slient) {
        let cache = this.getMyEditor().innerHTML.replace(ImgReg, function(img) {
          const match = img.match(TitleReg);
          if (!!match && !!match[0]) {
            return match[0];
          }
          return '';
        });
        cache = this.filterSafeHtml(cache);
        this.leftInput = this.maxLength - cache.length;
        if (!slient && !!this.writeHandler) {
          this.writeHandler(cache);
        }
        return cache;
      },

      verifyText() {
        const cache = this.tryStore();
        if (!cache.length) {
          return '文本不能为空';
        } else if (cache.length > this.maxLength) {
          return '文本长度超过最大长度' + this.maxLength;
        }
      },

      empty() {
        this.leftInput = 500;
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
      },
      focusEditor() {
        this.getMyEditor().focus();
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

      //bugfix: 当进入编辑器时，点击表情，选择的表情无法显示
      this.$nextTick(() => {
        this.focusEditor();
      });
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
      padding: 14px 15px;
      outline: 0;
      word-wrap: break-word;
      -webkit-hyphens: auto;
      -ms-hyphens: auto;
      hyphens: auto;
      background-color: #FFFFFF;
      overflow-y: auto;
      /*height: 80px!important;*/
      box-sizing: border-box;
    }
    .ql-editor::-webkit-scrollbar{
      width: 4px;
      height: 4px;
    }
    .ql-editor::-webkit-scrollbar-thumb {
      border-radius: 5px;
      box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
    }
    .ql-editor.ql-blank::before {
      color: rgba(0, 0, 0, 0.6);
      content: attr(data-placeholder);
      left: 15px;
      pointer-events: none;
      position: absolute;
      right: 15px;
    }
    .tip{
      position: absolute;
      right: 150px;
      bottom: -30px;
      z-index: 22;
      ._err{
        color: #FB4938;
      }
    }
  }

</style>
