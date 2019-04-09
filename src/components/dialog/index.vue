<template>
  <div class="list">
    <div class="main">
      <div class="header">
        <div class="search-bar">
          <el-input placeholder="搜索" @change="blurSearch" suffix-icon="el-icon-search" v-model="searchText"></el-input>
        </div>
        <p class="name">粽子</p>
      </div>
      <div class="count-view">
        <!--消息列表-->
        <div class="panel">
          <div class="chat-item" @click="getContact(index)" :class="chatId===index?'active':''"
               v-for="(item,index) in chatInfo" :key="index">
            <div class="avatar">
              <img src="./avatar.jpg" alt="">
            </div>
            <div class="info">
              <p class="nickname">{{item.name}}</p>
              <p class="content">{{item.msg}}</p>
            </div>
            <div class="ext" v-if="item.num>0">{{item.num}}</div>
          </div>
        </div>
        <div class="chat-area">
          <div class="scroll-wrapper">
            <!--聊天内容-->
            <div class="chat-content">
              <div class="other-message" v-if="otherMsg[chatId]">
                <div class="date">{{otherMsg[chatId].date}}</div>
                <div class="content" >
                  <div class="other" >
                    {{otherMsg[chatId].msg}}
                  </div>
                </div>
              </div>
              <div class="message" v-if="sendMsg[chatId]">
                <template>
                  <div class="date">{{sendMsg[chatId].date[0]}}</div>
                  <div class="content">
                    <div class="mine" v-if="!!sendMsg[chatId].msg" v-for="item in sendMsg[chatId].msg">
                      <span  v-html="item"></span>
                    </div>
                  </div>
                </template>

              </div>
            </div>
          </div>
          <div class="box-footer">
            <div class="expression" v-if="showExpression">
              <span v-for="item in expression" @click="appendToText(item)">{{item}}</span>
              <a class="add-new" @click="openAdd">新增</a>
            </div>
            <el-dialog
              title="新增常用语"
              :visible.sync="dialogVisible"
              width="30%"
              :before-close="handleClose">
              <textarea v-model="wordValue" class="my-word" contenteditable ref="myWord"></textarea>
              <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addExpression">添加</el-button>
              </span>
            </el-dialog>
            <div class="toolbar">
              <!--表情入口-->
              <emotion-panel  @picked="onPickedEmoji" :positionIsUp="true"></emotion-panel>
              <span class="icon-wrapper" @click="onPickedExpression">
                常用语
              </span>
            </div>
            <div class="content">
              <!---消息编辑-->
              <emotion-editor ref="emotionEditor"></emotion-editor>
            </div>
            <div class="action">
              <a @click="handleSendMsg" class="btn send-btn">发送</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import './index.less'
  import '../../assets/iconfont';
  import emotion from '../emotion/index';

  export default {
    components: {
      emotion
    },
    data() {
      return {
        input: '',
        chatInfo: [
          { avatar: '', name: '微信昵称', msg: '最近一条消息', num: 1 },
          { avatar: '', name: '微信昵称', msg: '最近一条消息', num: 1 },
          { avatar: '', name: '微信昵称', msg: '最近一条消息', num: 1 },
          { avatar: '', name: '微信昵称', msg: '最近一条消息', num: 1 },
          { avatar: '', name: '微信昵称', msg: '最近一条消息', num: 1 },
          { avatar: '', name: '微信昵称', msg: '最近一条消息', num: 1 }
        ],
        emojType: [{ name: 'qq表情' }],
        isShow: false,
        txt: null,
        senMsg: [],
        otherMsg: ['omg', 'fseg', 'sgdfdhfdh'],
        showEmoj: false,
        content: '',
        chatId: null,
        sendImg: '',
        date: '14:00',
        sendDate: '12:00',
        totalDate: ''
      };
    },
    methods: {
      openEmoj() {
        this.showEmoj = !this.showEmoj;
      },
      //获取发送消息实时时间(公众号)
      getTime() {
        let time = new Date();
        let year = time.getFullYear();
        let currentMonth = time.getMonth() + 1;
        if (currentMonth < 10) {
          currentMonth = '0' + currentMonth;
        }
        let day = time.getDate();
        if (day < 10) {
          day = '0' + day;
        }
        let hours = time.getHours();
        if (hours < 10) {
          hours = '0' + hours;
        }
        let minutes = time.getMinutes();
        if (minutes < 10) {
          minutes = '0' + minutes;
        }
        let second = time.getSeconds();
        this.sendDate = `${hours}:${minutes}`;
        this.totalDate = `${year}-${currentMonth}-${day} ${hours}:${minutes}`;
        let b = '2018-12-08 12:00';
        let dayBeween = this.dayBeween(this.totalDate, b);
        if (dayBeween > 1) {
          this.sendDate = `${currentMonth}-${day} ${hours}:${minutes}`;
        }
        let yearBeween = this.yearBeween(this.totalDate, b);
        if (yearBeween > 0) {
          this.sendDate = `${year}-${currentMonth}-${day} ${hours}:${minutes}`;
        }
      },
      //计算两个日期天数差
      dayBeween(day, newDay) {
        let dayMonth = day.substring(5, 7);
        let dayDay = day.substring(8, 10);
        let dayYear = day.substring(0, 4);

        let newDayMonth = newDay.substring(5, 7);
        let newDayDay = newDay.substring(8, 10);
        let newDayYear = newDay.substring(0, 4);

        let beween =
          (Date.parse(dayMonth + '/' + dayDay + '/' + dayYear) -
            Date.parse(newDayMonth + '/' + newDayDay + '/' + newDayYear)) /
          86400000;
        return Math.abs(beween);
      },
      //计算两个日期年份差
      yearBeween(day, newDay) {
        let dayYear = day.substring(0, 4);
        let newDayYear = newDay.substring(0, 4);
        let beween = Math.abs(dayYear - newDayYear);
        return beween;
  },
      openFile() {},
      getContact(e) {
        this.chatId = e;
      },
      sendMsg() {
        this.senMsg.push(this.txt);
        if (this.sendImg) {
        }
        this.txt = null;
        this.getTime();
      },
      closeEmoj() {
        this.showEmoj = false;
      },
      handleEmotion(i) {
        this.content += i;
        this.sendImg = this.content.replace(/\#[\u4E00-\u9FA5]{1,3}\;/gi, this.emotion);
      },
      // 将匹配结果替换表情图片
      emotion(res) {
        let word = res.replace(/\#|\;/gi, '');
        const list = [
          '微笑',
          '撇嘴',
          '色',
          '发呆',
          '得意',
          '流泪',
          '害羞',
          '闭嘴',
          '睡',
          '大哭',
          '尴尬',
          '发怒',
          '调皮',
          '呲牙',
          '惊讶',
          '难过',
          '酷',
          '冷汗',
          '抓狂',
          '吐',
          '偷笑',
          '可爱',
          '白眼',
          '傲慢',
          '饥饿',
          '困',
          '惊恐',
          '流汗',
          '憨笑',
          '大兵',
          '奋斗',
          '咒骂',
          '疑问',
          '嘘',
          '晕',
          '折磨',
          '衰',
          '骷髅',
          '敲打',
          '再见',
          '擦汗',
          '抠鼻',
          '鼓掌',
          '糗大了',
          '坏笑',
          '左哼哼',
          '右哼哼',
          '哈欠',
          '鄙视',
          '委屈',
          '快哭了',
          '阴险',
          '亲亲',
          '吓',
          '可怜',
          '菜刀',
          '西瓜',
          '啤酒',
          '篮球',
          '乒乓',
          '咖啡',
          '饭',
          '猪头',
          '玫瑰',
          '凋谢',
          '示爱',
          '爱心',
          '心碎',
          '蛋糕',
          '闪电',
          '炸弹',
          '刀',
          '足球',
          '瓢虫',
          '便便',
          '月亮',
          '太阳',
          '礼物',
          '拥抱',
          '强',
          '弱',
          '握手',
          '胜利',
          '抱拳',
          '勾引',
          '拳头',
          '差劲',
          '爱你',
          'NO',
          'OK',
          '爱情',
          '飞吻',
          '跳跳',
          '发抖',
          '怄火',
          '转圈',
          '磕头',
          '回头',
          '跳绳',
          '挥手',
          '激动',
          '街舞',
          '献吻',
          '左太极',
          '右太极'
        ];
        let index = list.indexOf(word);
        return `<img src="https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/${index}.gif" align="middle">`;
      }
    }
  };
</script>

