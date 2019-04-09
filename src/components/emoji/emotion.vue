<template>
  <span class="dss-emotion" :style="{'background-position':bp}"></span>
</template>

<script>
  export default {
    props: {
      bp: {
        type: String,
        default: ''
      }
    }
  };
</script>

<style>
  .dss-emotion {
    width: 20px;
    height: 20px;
    display: inline-block;
    cursor: pointer;
    vertical-align: middle;
    background: transparent url(https://res.wx.qq.com/mpres/en_US/htmledition/pages/modules/emoji_panel/icon_emotion_panel.2x.png) no-repeat 0 0;
    background-size: 20px auto;
  }
  .dss-emotion:hover{
    background-color: rgb(195, 189, 189);
    opacity: 0.8;
  }
</style>
