<template>
  <div class="emotion-panel" :class="positionIsUp?'emotion-panel-up':''">

    <a href="javascript:void(0);"
       class="_switch"
       :class="showEmotion?'_switch_hl':''"
       @click="clickShowEmotion">表情</a>

    <div class="_mask" v-if="showEmotion" @click="clickHideEmotion"/>

    <div class="_popover" v-if="showEmotion">
      <div class="emotion_wrap">
        <ul class="block_emotion">
          <li v-for="(item, index) in icons"
              :key="index"
              class="item_emotion"
              @click="pickEmotion(index) ">
            <emotion :bp="item.bp"/>
          </li>
        </ul>
      </div>
    </div>

  </div>
</template>

<script>
  import Emotion from '../emoji/emotion.vue';
  import emoji from '../emoji/index';

  export default {
    components: {
      Emotion
    },
    props: {
      positionIsUp: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        icons: emoji.Icons,
        showEmotion: false
      };
    },
    methods: {
      clickShowEmotion() {
        this.showEmotion = true;
      },
      clickHideEmotion() {
        this.showEmotion = false;
      },
      /**
       * 选中表情
       * @param index
       */
      pickEmotion(index) {
        this.$emit('picked', emoji.getEmojiImgBpByIconIndex(index));
      }
    }
  };
</script>

<style lang="less">

  .emotion-panel {
    display: inline-block;
    vertical-align: middle;
    position: relative;
    right: 240px;
    font-size: 14px;
    ._switch {
      float: left;
      line-height: 999em;
      overflow: hidden;
      background: transparent url("./icon_emotion_switch.png") no-repeat 0 0;
      width: 20px;
      height: 20px;
      vertical-align: middle;
      display: inline-block;
    }
    ._switch_hl {
      background: transparent url("./icon_emotion_switch_hl.png") no-repeat 0 0;
    }
  }

  ._mask {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(255, 255, 255, 0);
    z-index: 300;
    cursor: default;
    color: #FFFFFF;
  }

  ._popover {
    white-space: normal;
    word-wrap: break-word;
    -webkit-hyphens: auto;
    -ms-hyphens: auto;
    hyphens: auto;
    /*box-sizing: border-box;*/
    position: absolute;
    z-index: 500;
    text-align: left;
    color: #353535;
    line-height: 1.6;
    background: #FFFFFF;
    box-shadow: 0 1px 20px 0 #E4E8EB;
    border-radius: 2px;

    width: 396px;
    padding: 5px;
    left: 50%;
    margin-left: -46px;
    top: 100%;
    margin-top: 16px;

  }

  ._popover:after {
    content: " ";
    background-color: #FFFFFF;
    position: absolute;
    height: 10px;
    top: 0;
    left: 0;
    right: 0;
  }

  ._popover:before {
    content: " ";
    width: 8px;
    height: 8px;
    background-color: #FFFFFF;
    box-shadow: 0 2px 10px 0 #D4D4D4;
    transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
    -ms-transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
    -webkit-transform: matrix(0.71, 0.71, -0.71, 0.71, 0, 0);
    position: absolute;
    left: 42px;
    top: -4px;
  }

  .block_emotion {
    position: relative;
    z-index: 1;
    .item_emotion {
      float: left;
      width: 24px;
      height: 24px;
      line-height: 24px;
      font-size: 0;
      text-align: center;
      background-color: #FFFFFF;
    }
  }

  .emotion-panel-up{
    ._popover {
      top: -180px;
    }
    ._popover:after {
      top: 172px;
      height: 5px;
    }
    ._popover:before {
      top: 172px;
    }
  }

</style>
