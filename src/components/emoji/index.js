import AllData from './AllData';
import RequireData from './RequireData';

const BlankImg = 'https://mp.weixin.qq.com/mpres/zh_CN/htmledition/comm_htmledition/images/pic/common/pic_blank.gif';
const RecoveryReg = new RegExp('(\\[[^\\[\\]]*\\])', 'g');

const props = {
  emojiHeight: 20,
  rowCount: 16,
  columnCount: 7
};

const Icons = [];
const IconNameMap = {};

function getBp(y) {
  return `0 -${y}px`;
}

function init() {
  let e = props.emojiHeight,
    t = props.rowCount,
    o = props.columnCount,
    i = [],
    s = 0;
  for (; s < RequireData.length; s++)
    for (let a = 0; a < AllData.length; a++)
      if (AllData[a].id === RequireData[s]) {
        i[s] = AllData[a];
        break;
      }
  for (let m = 0; m < o; m++)
    for (let l = 0; l < t; l++) {
      let c = m * t + l;
      if (i[c]) {
        Icons.push(
          (IconNameMap[i[c].cn] = {
            index: Icons.length,
            name: i[c].cn,
            emoji: i[c].emoji || '',
            bp: getBp(c * e)
          })
        );
      }
    }
}

init();

function getEmojiImgBpByIconIndex(index) {
  const item = Icons[index];
  return `<img src="${BlankImg}" title="${item.name}" class="wx-emoji-sharp" style="background-position: ${item.bp}"/>`;
}

function getEmojiImgByIconIndex(index) {
  const item = Icons[index];
  return {
    src: BlankImg,
    backgroundPosition: item.bp
  };
}

//还原文本，到页面
function recoveryEmojiTextToHtml(text) {
  text = text || '';
  const matched = text.match(RecoveryReg);
  if (!!matched && !!matched.length) {
    const tasks = {};
    const RmvBorderReg = new RegExp('\\[|\\]', 'g');
    matched.forEach(match => {
      if (IconNameMap.hasOwnProperty(match)) {
        if (!tasks.hasOwnProperty(match)) {
          const item = IconNameMap[match];
          tasks[match] = `<img src="${BlankImg}" title="${
            item.name
          }" class="wx-emoji-sharp"  style="background-position: ${item.bp}"/>`;
        }
      }
    });
    for (let match in tasks) {
      text = text.replace(new RegExp('\\[' + match.replace(RmvBorderReg, '') + '\\]', 'g'), tasks[match]);
    }
  }
  return text;
}

export default {
  Icons,
  IconNameMap,
  getEmojiImgByIconIndex,
  getEmojiImgBpByIconIndex,
  recoveryEmojiTextToHtml
};
