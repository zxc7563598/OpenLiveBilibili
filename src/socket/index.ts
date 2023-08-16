import DanmakuWebSocket from "../assets/danmaku-websocket.min.js"
import config from '../config/config';
import { ref } from "vue"
import axios from "axios"

let ws: DanmakuWebSocket

const authBody = ref("")
const wssLinks = ref([])
// heartBeat Timer
const heartBeatTimer = ref<NodeJS.Timer>()

const api = axios.create({
    baseURL: config.apiUrl
})

/**
 * 创建socket长连接
 * @param authBody
 * @param wssLinks
 */
function createSocket(authBody: string, wssLinks: string[]) {
    const opt = {
        ...getWebSocketConfig(authBody, wssLinks),
        // 收到消息,
        onReceivedMessage: (res: any) => {
            console.log(res)
        },
        // 收到心跳处理回调
        onHeartBeatReply: (data: any) => console.log("心跳", data),
        onError: (data: any) => console.log("错误", data),
        onListConnectError: () => {
            console.log("连接错误")
            destroySocket()
        },
    }
    if (!ws) {
        ws = new DanmakuWebSocket(opt)
    }
    return ws
}

/**
 * 获取websocket配置信息
 * @param authBody
 * @param wssLinks
 */
function getWebSocketConfig(authBody: string, wssLinks: string[]) {
    const url = wssLinks[0]
    const urlList = wssLinks
    const auth_body = JSON.parse(authBody)
    return {
        url,
        urlList,
        customAuthParam: [
            {
                key: "key",
                value: auth_body.key,
                type: "string",
            },
            {
                key: "group",
                value: auth_body.group,
                type: "string",
            },
        ],
        rid: auth_body.roomid,
        protover: auth_body.protoover,
        uid: auth_body.uid,
    }
}

/**
 * 销毁websocket
 */
function destroySocket() {
    console.log("开始销毁websocket")
    ws && ws.destroy()
    ws = undefined
    console.log("销毁完成")
}

/**
 * 鉴权
 * 
 * @param timestamp 时间戳
 * @param code 身份码
 * @param mid 用户id
 * @param caller 固定bilibili
 * @param sign 签名
 * @returns 
 */
function getAuth(timestamp: any, code: any, mid: any, caller: any, sign: any) {
    return api.post("/getAuth", {
        timestamp: "" + timestamp,
        code: "" + code,
        mid: "" + mid,
        caller: "" + caller,
        sign: "" + sign
    }).then(({ data }) => {
        if (data.code == 0) {
            if (data.data.success) {
                return true
            }
        }
        return false;
    }).catch((err) => {
        return false;
    })
}

function gameStart(code: any, app_id: any) {
    console.log("游戏开始")
    // 游戏开始，获取游戏id
    api.post("/gameStart", {
        code: code, // 身份识别码
        app_id: app_id, // 应用id
    }).then(({ data }) => {
        if (data.code === 0) {
            const res = data.data
            const { game_info, websocket_info } = res
            const { auth_body, wss_link } = websocket_info
            console.log("-----游戏开始成功-----")
            console.log(res)
            console.log("-----建立websocket-----")
            createSocket(auth_body, wss_link)
            heartBeatTimer.value = setInterval(() => {
                heartBeatThis(game_info.game_id, code, app_id)
            }, 20000)
        } else {
            console.log("-----游戏开始失败-----")
            console.log(data)
        }
    }).catch((err) => {
        console.log("-----游戏开始失败-----")
        console.log(err)
    })
}

function heartBeatThis(game_id: any, code: any, app_id: any) {
    // 心跳 是否成功
    api.post("/gameHeartBeat", {
        game_id: game_id,
        code: code,
        app_id: app_id,
    }).then(({ data }) => {
        if (data.code != 0) {
            console.log("-----心跳失败-----")
            gameEnd(game_id, app_id);
        }
    }).catch((err) => {
        console.log("-----心跳失败-----")
        gameEnd(game_id, app_id);
    })
}

function gameEnd(game_id: any, app_id: any) {
    api.post("/gameEnd", {
        game_id: game_id,
        app_id: Number(app_id),
    }).then(({ data }) => {
        if (data.code === 0) {
            console.log("-----游戏关闭成功-----")
            console.log("返回：", data)
            // 清空长链
            authBody.value = ""
            wssLinks.value = []
            if (heartBeatTimer.value) {
                clearInterval(heartBeatTimer.value);
                heartBeatTimer.value = undefined;
            }
            destroySocket()
            console.log("-----心跳关闭成功-----")
        } else {
            console.log("-----游戏关闭失败-----")
            console.log(data)
        }
    }).catch((err) => {
        console.log("-----游戏关闭失败-----")
        console.log(err)
    })
}

export { getAuth, gameStart }