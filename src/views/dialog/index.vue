<template>
  <div class="list">
    <div class="main">
      <div class="header">
        <div class="search-bar">
          <el-input placeholder="搜索" suffix-icon="el-icon-search" v-model="searchText"></el-input>
        </div>
        <p class="name">{{chatName}}</p>
      </div>
      <div class="count-view">
        <!--消息列表-->
        <div class="panel">
          <div class="chat-item" @click="getContact(index)" :class="chatId===index?'active':''"
               v-for="(item,index) in chatList" :key="index">
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
          <!--<chat-message ref="chatMessage" @session="handleMsgSession"></chat-message>-->
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
  import '../../assets/iconfont';
  import './index.less';
  import EmotionEditor from '../../components/emotion-textarea/EmotionEditor.vue';
  import EmotionPanel from '../../components/emotion-textarea/EmotionPanel.vue';
  import ChatMessage from '../../components/chat-mesage/index';
  export default {
    components: {
      EmotionEditor,
      EmotionPanel,
      ChatMessage
    },
    data() {
      return {
        chatInfo: [
          { avatar: '', name: '柠檬酱', msg: 'hello', num: 1,reply:false,status:true,id:42,msgType:'text' },
          { avatar: '', name: 'lemon', msg: '哈哈哈', num: 1,reply:false,status:true,id:45,msgType:'text' },
          { avatar: '', name: '小可爱', msg: '我只是路过', num: 1,reply:false,status:true,id:36,msgType:'text' },
          { avatar: '', name: '哈哈哈', msg: '我是一只小绵羊', num: 1,reply:false,status:true,id:50,msgType:'text' },
          { avatar: '', name: '大猪蹄子', msg: '我还有话要说', num: 1,reply:false,status:true,id:18,msgType:'text' },
          { avatar: '', name: 'test', msg: '我是一手烤牛油', num: 1,reply:false,status:true,id:66,msgType:'text' }
        ],
        isShow: false,
        sendMsg: [
          { id: 0, msg: [], date: [] },
          { id: 1, msg: [], date: [] },
          { id: 2, msg: [], date: [] },
          { id: 3, msg: [], date: [] },
          { id: 4, msg: [], date: [] },
          { id: 5, msg: [], date: [] }
        ],
        otherMsg: [
          { id: 0, msg: 'Hello', date: '14:00' },
          { id: 1, msg: '哈哈哈', date: '12:30' },
          { id: 2, msg: '我只是路过', date: '10:25' },
          { id: 3, msg: '我是一只小绵羊', date: '14:30' },
          { id: 4, msg: '我还有话要说', date: '18:45' },
          { id: 5, msg: '我是一手烤牛油', date: '21:30' }
        ],
        content: '',
        chatId: -1,
        sendImg: '',
        sendDate: '12:00',
        totalDate: '',
        showExpression: false,
        dialogVisible: false,
        expression: [
          '你好，请问有什么可以帮到您？',
          '抱歉让你久等了。'
        ],
        wordValue: '',
        searchText: '',
        chatName:'',
        isSessionOut: false,
        loop: {
          left: 0
        },
        chatListQueryParams: {
          pageNo: 1,
          pageSize: 10,
          nickname: '',
          hashMore: true,
          _loading: false
        }
      };
    },
    computed:{
      chatList(){
        let search=this.searchText
        if(!!search && search.length>0){
          return this.chatInfo.filter(value=>{
            if (value.name) {
              return  value.name.indexOf(this.searchText) !== -1;
            }
          })
        }
        else {
          return this.chatInfo;
        }
      }
    },
    methods: {
      //获取发送消息实时时间
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
        if (second < 10) {
          second = '0' + minutes;
        }
        this.sendDate = `${hours}:${minutes}`;
        this.totalDate = `${year}-${currentMonth}-${day} ${hours}:${minutes}:${second}`;
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
      getContact(e) {
        this.chatId = e;
        this.chatInfo[e].num = 0;
        this.chatName=this.chatInfo[e].name;
        console.log('chatId', this.chatId);
      },
      handleSendMsg() {
        const cache = this.$refs.emotionEditor.getLocalText();
        if (this.chatId !== -1) {
          this.sendMsg[this.chatId].msg.push(cache);
          this.getTime();
          this.sendMsg[this.chatId].date.push(this.sendDate);
          console.log('我发送的msg', this.sendMsg);
          setTimeout(() => {
            this.$refs.emotionEditor.empty();
          }, 200);
        }
      },
      onPickedEmoji(img) {
        console.log('onPickedEmoji', img);
        this.$refs.emotionEditor.insertEmoji(img);
      },
      onPickedExpression() {
        this.showExpression = true;
      },
      openAdd() {
        this.dialogVisible = true;
      },
      addExpression() {
        if (this.wordValue) {
          this.expression.push(this.wordValue);
        }
        this.dialogVisible = false;
        console.log(this.expression);
      },
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },
      appendToText(e) {
        console.log('选中的常用语', e);
        this.$refs.emotionEditor.setLocalText(e);
        this.showExpression = false;
      },
      handleMsgSession(e) {
        this.isSessionOut = e;
        // console.log('isSessionOut', e);
      },
      clickMoreLeftChat() {
        if (this.chatListQueryParams.hashMore) {
          this.getLeftChatList();
        }
      },
      isFreshLeft() {
        return !!this.loop && this.chatListQueryParams._loading;
      },
      //获得客服消息列表
      // getLeftChatList(fresh) {
      //
      // },
    }
  };
</script>

