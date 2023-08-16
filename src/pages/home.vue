<script lang="ts" setup>
import queryString from 'query-string';
import { getAuth, gameStart } from "../socket/index"
import { ref, onMounted, onUpdated, onBeforeUnmount } from 'vue';
import config from '../config/config';
// 获取url参数
const parsedParams = queryString.parseUrl(location.search).query;

var Timestamp = parsedParams.Timestamp
var RoomId = parsedParams.RoomId
var Mid = parsedParams.Mid
var Caller = parsedParams.Caller
var Sign = parsedParams.Sign
var Code = parsedParams.Code
var CodeSign = parsedParams.CodeSign
var plug_env = parsedParams.plug_env

onMounted(() => {
    console.log("页面启动");
    if (Timestamp && Code && Mid && Caller && Sign && RoomId && CodeSign) {
        getAuth(Timestamp, Code, Mid, Caller, Sign).then(success => {
            if (success) {
                gameStart(Code, config.appId)
            } else {
                console.log("鉴权失败,签名异常");
            }
        })
    } else {
        console.log("URL参数缺失")
    }
});

onUpdated(() => {
    console.log("onUpdated");
});

onBeforeUnmount(() => {
    console.log("onBeforeUnmount");
});
</script>

<template>
    <div class="home">
        <p>请打开控制台查看信息</p>
    </div>
</template>


<style scoped></style>