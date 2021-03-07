// version v0.0.2
// create by ruicky
// detail url: https://github.com/ruicky/jd_sign_bot

const exec = require('child_process').execSync;
const fs = require('fs');
const rp = require('request-promise');
const download = require('download');

// 公共变量
const KEY = process.env.JD_COOKIE;
const serverJ = process.env.PUSH_KEY;
const DualKey = process.env.JD_COOKIE_2;
const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
const TG_USER_ID = process.env.TG_USER_ID;


// =======================================telegram机器人通知设置区域===========================================
//此处填你telegram bot 的Token，例如：1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw
//(环境变量名 TG_BOT_TOKEN)
let TG_BOT_TOKEN = '';
//此处填你接收通知消息的telegram用户的id，例如：129xxx206
//(环境变量名 TG_USER_ID)
let TG_USER_ID = '';

if (process.env.TG_BOT_TOKEN) {
  TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
}
if (process.env.TG_USER_ID) {
  TG_USER_ID = process.env.TG_USER_ID;
}







async function downFile () {
    // const url = 'https://cdn.jsdelivr.net/gh/NobyDa/Script@master/JD-DailyBonus/JD_DailyBonus.js'
    const url = 'https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js';
    await download(url, './');
}

async function changeFile () {
   let content = await fs.readFileSync('./JD_DailyBonus.js', 'utf8')
   content = content.replace(/var Key = ''/, `var Key = '${KEY}'`);
   if (DualKey) {
    content = content.replace(/var DualKey = ''/, `var DualKey = '${DualKey}'`);
   }
   await fs.writeFileSync( './JD_DailyBonus.js', content, 'utf8')
}

async function sendNotify (text,desp) {
  const options ={
    uri:  `https://sc.ftqq.com/${serverJ}.send`,
    form: { text, desp },
    json: true,
    method: 'POST'
  }
  await rp.post(options).then(res=>{
    console.log(res)
  }).catch((err)=>{
    console.log(err)
  })
}

async function start() {
  if (!KEY) {
    console.log('请填写 key 后在继续')
    return
  }
  // 下载最新代码
  await downFile();
  console.log('下载代码完毕')
  // 替换变量
  await changeFile();
  console.log('替换变量完毕')
  // 执行
  await exec("node JD_DailyBonus.js >> result.txt");
  console.log('执行完毕')

  if (TG_BOT_TOKEN && TG_USER_ID) {
      const options = {
        url: `https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`,
        body: `chat_id=${TG_USER_ID}&text=${text}\n${desp}&disable_web_page_preview=true`,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
      if (process.env.TG_PROXY_HOST && process.env.TG_PROXY_PORT) {
        const tunnel = require("tunnel");
        const agent = {
          https: tunnel.httpsOverHttp({
            proxy: {
              host: process.env.TG_PROXY_HOST,
              port: process.env.TG_PROXY_PORT * 1
            }
          })
        }
        Object.assign(options, { agent })
      }
      $.post(options, (err, resp, data) => {
        try {
          if (err) {
            console.log('telegram发送通知消息失败！！\n')
            console.log(err);
          } else {
            data = JSON.parse(data);
            if (data.ok) {
              console.log('Telegram发送通知消息完成。\n')
            } else if (data.error_code === 400) {
              console.log('请主动给bot发送一条消息并检查接收用户ID是否正确。\n')
            } else if (data.error_code === 401){
              console.log('Telegram bot token 填写错误。\n')
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve(data);
        }
      })
    } else {
      console.log('您未提供telegram机器人推送所需的TG_BOT_TOKEN和TG_USER_ID，取消telegram推送消息通知\n');
      resolve()
    }
    
    
    
    
    
    if (serverJ) {
    const path = "./result.txt";
    let content = "";
    if (fs.existsSync(path)) {
      content = fs.readFileSync(path, "utf8");
    }
    let t = content.match(/【签到概览】:((.|\n)*)【签到奖励】/)
    let res = t ? t[1].replace(/\n/,'') : '失败'
    let t2 = content.match(/【签到奖励】:((.|\n)*)【其他奖励】/)
    let res2 = t2 ? t2[1].replace(/\n/,'') : '总计0'

    
    await sendNotify("" + ` ${res2} ` + ` ${res} ` + new Date().toLocaleDateString(), content);
  }
}

start()
