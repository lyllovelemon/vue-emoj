<template>
    <div class="chat-messgae">
      <!--聊天消息-->
      <div class="scroll-wrapper" >
        <div class="chat-content" ref="chat-content">
          <div class="oa-msg-more" @click="handlerGetMoreChatMessage">
            {{params._loading?'刷新中...':params.hasMore?'加载更多':''}}
          </div>
          <div class="other-message" ref="chat-other-msg" v-if="totalList.length>0">
            <div class="chat-wrapper" v-for="item in totalList" :key="item.id">
              <div class="date" v-if="item.showTime">{{item.createTime|chatTime}}</div>
              <div class="content" v-if="!item.reply">
                <div class="avatar">
                  <img :src="item.headImgUrl" alt="">
                </div>
                <!--文本消息-->
                <div class="other" v-if="item.msgType==='text'"
                     v-html="item.msgBody.content">
                </div>
                <!--语音消息-->
                <div class="other" v-else-if="item.msgType==='voice'">
                  <audio-player
                    :value="item.id"
                    :url="item.msgBody.url">
                  <span slot-scope="audio">
                    <span v-show="!audio.errorTip">
                      <!-- {{audio.showDur}} -->【语音】
                    </span>
                    <span v-show="!!audio.errorTip">
                      {{'【' + audio.errorTip + '】'}}
                    </span>
                  </span>
                  </audio-player>
                </div>
                <!--图片消息-->
                <div class="other image-msg" v-else-if="item.msgType==='image'">
                  <img class="image-msg-main" :src="item.msgBody.url" alt=" 【图片】">
                </div>
                <!--视频消息-->
                <div class="other voice-msg" v-else-if="item.msgType==='video'">
                  <img
                    class="voice-msg-main"
                    :src="PlayIcon"
                    @click="showVideoPlayer(item.msgBody)"/>
                  【视频】
                </div>
              </div>
              <div class="back-content" v-else>
                <!--文本消息-->
                <div class="mine" v-if="item.msgType==='text'"
                     v-html="item.msgBody.content">
                </div>
                <!--图片消息-->
                <div class="mine image-msg" v-else-if="item.msgType==='image'">
                  <img class="image-msg-main" :src="item.msgBody.url" alt=" 【图片】">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
<script>
	export default {
		data() {
		  return{
		    totalList:[],
        replyId: -1,
        params:{
		      pageNo:1,
          pageSize:10,
          id:'',
          hasMore:false,
          _loading:false
        }
      }
		},
		components: {},
    filters:{
		  chatTime(value){
		    return this.timeFormat(value, 'YYYY-MM-DD HH:mm');
      }
    },
    methods:{
      timeFormat(time, format = 'YYYY-MM-DD HH:mm:ss') {
        if (!time) {
          return '';
        }
        if (this.isNumber(time) && (time + '').length === 10) {
          time *= 1000;
        }
        if (!this.isDate(time)) {
          time = new Date(time);
        }
        const year = time.getFullYear();
        const month = time.getMonth();
        const day = time.getDate();
        const hours24 = time.getHours();
        const hours = hours24 % 12 === 0 ? 12 : hours24 % 12;
        const minutes = time.getMinutes();
        const seconds = time.getSeconds();
        const milliseconds = time.getMilliseconds();
        const dd = t => ('0' + t).slice(-2);
        const map = {
          YYYY: year,
          MM: dd(month + 1),
          M: month + 1,
          DD: dd(day),
          D: day,
          HH: dd(hours24),
          H: hours24,
          hh: dd(hours),
          h: hours,
          mm: dd(minutes),
          m: minutes,
          ss: dd(seconds),
          s: seconds,
          S: milliseconds
        };
        return (format || this.format).replace(/Y+|M+|D+|H+|h+|m+|s+|S+/g, str => map[str]);
      },
      getChatList(pageNo, isNewReplyId) {
        this.params.id = this.replyId;
        this.params.pageNo = pageNo;
        this.params._loading = true;

        if (isNewReplyId) {
          this.totalList = [];
        }

        let params = { ...this.params };

        if (params.pageNo === 1) {
          //来自定时刷新请求
          if (this.totalList.length > 0) {
            params.pageSize = this.totalList.length;
          }
        } else {
          //加载更多
          params.pageSize = this.params.pageSize;
        }
        return api
          .chartDetailList(params)
          .then(res => {
            this.params._loading = false;
            const { data, totalCount } = res;
            if (!data || !data.length) {
              return;
            }

            //未读消息id列表
            const unReads = [];
            const TEN_MIN = 60 * 10;
            //反转排序
            let newList = data.reverse();
            newList.forEach((item, index) => {
              //文本消息转换表情符号
              item.msgBody = JSON.parse(item.msgBody);
              if (item.msgType === 'text') {
                item.msgBody.content = this.filterWxImageText(item.msgBody.content);
              }
              //用户图片/音频/视频消息 -> 通过proxy方式访问
              // if (!item.reply && item.msgBody.url) {
              //   item.msgBody.url =
              //     location.protocol + '//' + location.host + '/wp/im/message/readFile?filePath=' + item.msgBody.url;
              // }
              //标记未读取
              if (!item.status) {
                unReads.push(item.id);
              }
              //消息时间显示控制
              if (index === 0) {
                if (this.totalList.length > 0) {
                  item.showTime = item.createTime - this.totalList[0].createTime > TEN_MIN;
                } else {
                  item.showTime = true;
                }
              } else {
                item.showTime = item.createTime - newList[index - 1].createTime > TEN_MIN;
              }
            });

            let totalList = params.pageNo === 1 ? newList : newList.concat(this.totalList);

            if (params.pageNo === 1) {
              this.$emit('session', this.isSessionOut(totalList));
            }

            //标注服务端未读消息
            if (unReads.length > 0) {
              api.read(unReads.join(','));
            }

            if (isNewReplyId) {
              this.$nextTick(() => {
                if (!!this.$refs['chat-content']) {
                  this.$refs['chat-content'].scrollTop = 100000000;
                }
              });
            } else {
              const changed =
                this.totalList.length !== totalList.length ||
                this.totalList[this.totalList.length - 1].id !== totalList[totalList.length - 1].id;

              if (!!changed) {
                let container = this.$refs['chat-content'];
                let inner = this.$refs['chat-other-msg'];
                if (!!container && !!inner) {
                  let top = container.scrollTop;
                  let height = inner.clientHeight;
                  this.$nextTick(() => {
                    container.scrollTop = top + inner.clientHeight - height;
                  });
                }
              }
            }
            //是否还有更多消息
            this.params.hasMore = totalCount > (this.totalList = totalList).length;
          })
          .catch(() => {
            this.params._loading = false;
          });
      },
      handlerGetMoreChatMessage() {
        if (!this.params._loading) {
          this.getChatList(parseInt(this.totalList.length / this.params.pageSize + 1));
        }
      },
    }
	}
</script>
