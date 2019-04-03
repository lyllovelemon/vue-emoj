<template>
  <div class="main">
    <div class="header">
      <div class="search-bar">
        <el-input
          placeholder="搜索"
          suffix-icon="el-icon-search"
          v-model="input">
        </el-input>
      </div>
      <p class="name">微信昵称</p>
    </div>
    <div class="count-view">
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
          <div class="ext">{{item.num}}</div>
        </div>
      </div>
      <div class="chat-area">
        <div class="scroll-wrapper">
          <div class="chat-content">
            <div class="other-message">
              <div class="date">{{date}}</div>
              <div class="content" v-if="otherMsg.length">
                <div class="other" v-for="item in otherMsg">
                  {{item}}
                </div>
              </div>
            </div>
            <div class="message" v-if="senMsg.length">
              <div class="date">{{sendDate}}</div>
              <div class="content">
                <div class="mine" v-for="item in senMsg">
                  <span v-if="sendImg && !item" v-html="sendImg"></span>
                  <span v-if="item && !sendImg">{{item}}</span>
                  <span v-if="item && sendImg">表情包拼文字，OMG</span>
                </div>
              </div>

            </div>

          </div>

        </div>
        <div class="box-footer">
          <div class="emoj-panel" v-if="showEmoj">
            <div class="expression">
              <ul class="top">
                <li v-for="item in emojType" :class="isShow?'active':''">{{item.name}}</li>
              </ul>
              <div class="emoj-wrapper">
                <emotion @emotion="handleEmotion" class="emoj-list"></emotion>
              </div>
            </div>

          </div>
          <div class="toolbar">
            <span class="icon-wrapper" @click="openEmoj">
               <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-biaoqing"></use>
              </svg>
            </span>
            <span class="icon-wrapper">
              <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-jieping"></use>
            </svg>
           </span>
            <span class="icon-wrapper file-wrapper" @click="openFile">
             <input type="file" class="file-select">
             <label class="svg-file">
               <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-wenjian"></use>
            </svg>
             </label>

           </span>
          </div>
          <div class="content" @click="closeEmoj">
            <!--表情包文字转义为图片-->
            <span class="img-wrapper" v-html="content.replace(/\#[\u4E00-\u9FA5]{1,3}\;/gi, emotion)"></span>
            <textarea name="" id="" cols="10" rows="250" v-model="txt">
           </textarea>
          </div>
          <div class="action">
            <span class="desc">按下Ctrl+Enter换行</span>
            <a @click="sendMsg" class="btn send-btn">发送</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
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
<style lang="less">
  .main {
    height: 100%;
    max-width: 1000px;
    min-width: 800px;
    /*margin: 0 auto;*/
    margin-left: 20px;
    padding-bottom: 40px;

    .icon {
      width: 15px;
      height: 15px;
      vertical-align: -0.15em;
      fill: currentColor;
      overflow: hidden;
      cursor: pointer;
    }

    .header {
      position: relative;
      width: 100%;
      height: 76px;
      border-bottom: 1px solid #dddddd;
      display: flex;
      align-items: center;

      .search-bar {
        width: 150px;
      }

      .name {
        padding-left: 140px;
      }
    }

    .count-view {
      display: flex;
      justify-content: flex-start;

      .panel {
        display: flex;
        flex-direction: column;
        width: 280px;
        height: 350px;
        overflow-y: scroll;

        .chat-item {
          padding: 12px 18px 11px;
          display: flex;
          align-items: center;
          position: relative;
          border-bottom: 1px solid #dddddd;
          cursor: pointer;

          .avatar {
            margin-right: 10px;
            img {
              width: 40px!important;
              border-radius: 2px;
            }
          }

          .ext {
            position: absolute;
            right: 10px;
            bottom: 15px;
          }

        }

        .active {
          background: rgba(0, 0, 0, .2);
        }
      }

      .panel::-webkit-scrollbar {
        width: 4px;
        height: 4px;
      }

      .panel::-webkit-scrollbar-thumb {
        border-radius: 5px;
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
      }

      .chat-area {
        width: 720px;
        position: relative;
        background-color: #eee;

        .scroll-wrapper {
          width: 100%;
          bottom: 180px;
          overflow: hidden;
          cursor: pointer;

          .chat-content {
            display: flex;
            flex-direction: column;
            height: 220px;
            overflow-y: scroll;

            .other-message {
              .date {
                display: flex;
                justify-content: center;
                margin: 10px auto;
                max-width: 50%;
                color: #b2b2b2;
                font-size: 12px;
              }

              .content {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                margin-left: 10px;

                .other {
                  background: #FFFFFF;
                  font-size: 14px;
                  vertical-align: top;
                  padding: 5px;
                  margin: 10px 0;
                }
              }
            }

            .message {
              .date {
                display: flex;
                justify-content: center;
                margin: 10px auto;
                max-width: 50%;
                color: #b2b2b2;
                font-size: 12px;
              }

              .content {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                justify-content: flex-end;
                margin-right: 10px;

                .mine {
                  background: #b2e281;
                  font-size: 14px;
                  vertical-align: top;
                  padding: 5px;
                  margin: 10px 0;
                }
              }
            }
          }

          .chat-content::-webkit-scrollbar {
            width: 7px;
          }

          .chat-content::-webkit-scrollbar-thumb {
            border-radius: 10px;
            background: #6c6e71;
            border-radius: 7px;
          }
        }

        .box-footer {
          height: 130px;
          margin-right: 19px;
          border-top: 1px solid #d6d6d6;
          position: relative;

          .emoj-panel {
            width: 500px;
            height: 174px;
            background: #FFFFFF;
            position: absolute;
            left: 50%;
            transform: translateX(-68%);
            z-index: 99;
            top: -181px;

            .expression::before {
              content: "";
              position: absolute;
              left: 16px;
              top: 100%;
              margin-left: -7px;
              border: 7px solid transparent;
              border-top-color: #cfcfcf;
            }

            .expression {
              .top {
                padding: 8px 20px 0;
                list-style: none;
                display: flex;
                justify-content: flex-start;
                background: #f2f2f2;

                li {
                  list-style: none;
                  color: #333;
                  padding: 5px 20px;
                  font-size: 14px;
                  cursor: pointer;
                }

                .active {
                  background: #FFFFFF;
                }
              }

              .emoj-wrapper {
                .emoj-list {
                  width: 480px;
                  height: 134px;
                  overflow-y: scroll;
                  margin: 0 20px;
                }
              }
            }
          }
        }

        .toolbar {
          height: 30px;
          padding: 5px 17px;

          .icon-wrapper {
            display: inline-flex;
            margin: 0 5px;
            width: 15px;
            height: 15px;
            align-items: center;
            justify-content: center;
          }

          .file-wrapper {
            position: relative;

            .file-select {
              position: absolute;
              clip: rect(1px, 1px, 1px, 1px);
              left: 0;
            }

            .svg-file {
              width: 100%;
              height: 100%;
            }
          }
        }

        .content {
          position: relative;

          .img-wrapper {
            padding-left: 20px;
            display: inline-flex;
            flex-wrap: wrap;
          }

          textarea {
            width: 100%;
            height: 58px;
            overflow-y: auto;
            overflow-x: hidden;
            padding-left: 20px;
            outline: none;
            background: #EEEEEE;
            border: 0;
            font-size: 14px;
          }
        }

        .action {
          text-align: right;
          position: absolute;
          bottom: 10px;
          right: 10px;

          .send-btn {
            background-color: #fff;
            color: #222;
            padding: 5px 30px;
          }
        }
      }
    }
  }

</style>

