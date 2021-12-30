<template>
    <div>
        <!---->
        <h1 style="text-decoration: underline">Tools ▼</h1>

        <h2>Timestamp</h2>
        <div v-if="showTimestamp">
            <input :value="timestamp" placeholder="timestamp" @input="changeTimestamp"/>

            <select :value="unit" @input="changeUnit">
                <option value="ms">ms</option>
                <option value="s">s</option>
            </select>

            <span> <=> </span>

            <input :value="date" placeholder="date" @input="changeDate" style="width: 400px"/>

        </div>

        <h2>Worktime</h2>
        <div v-if="showWorktime">
            <label>Time:</label><input v-model="workTime.from"/> <span>To</span> <input v-model="workTime.to"/>
            <div v-for="exclude in workTime.excludes">
                <label>Exclude:</label> <input v-model="exclude.from"/> <span>To</span> <input v-model="exclude.to"/>
            </div>

            <label>Result:</label> <span>{{workTimeResult}}</span>
        </div>
    </div>
</template>

<script>
    module.exports = {
        name: "TimeTools",
        components:{
        },
        props: [],
        data() {
            return {
                showTimestamp:true,
                showWorktime:true,
                timestamp:null,
                unit:"ms",
                date:"",
                workTime:{
                    "from":"10:00",
                    "to":"18:00",
                    excludes:[{"from":"12:15","to":"14:00"},{"from":"18:15","to":"19:00"}]
                }
            }
        },
        computed:{
            workTimeResult(){
                let start = this.parseMinutes(this.workTime.from)
                let end = this.parseMinutes(this.workTime.to)
                if(isNaN(start) || isNaN(end)){
                    return "Time Range Error"
                }
                if(end<start){
                    end = end + 24*60
                }
                let sum = 0
                let error = false
                let completed = false
                for(let exclude of this.workTime.excludes){
                    let excludeFrom =this.parseMinutes(exclude.from)
                    let excludeTo = this.parseMinutes(exclude.to)
                    if(isNaN(excludeFrom) || isNaN(excludeTo)){
                        return "Exclude Range Error"
                    }
                    if(excludeTo < excludeFrom){
                        return "Exclude Range Invalid"
                    }
                    if(start >= excludeFrom){
                        if(end <= excludeTo){
                            completed = true
                            break
                        }
                        if(start < excludeTo){
                            start = excludeTo
                        }
                        continue
                    }
                    if(end<=excludeFrom){
                        sum += end -start
                        completed = true
                        break
                    }
                    sum += excludeFrom - start
                    start = excludeTo
                    if(start >= end){
                        completed = true
                        break
                    }
                }
                if(!error){
                    if(!completed && end >= start){
                        sum += end - start
                    }
                    return this.toHourAndMinute(sum)
                }
                return "Error"
            }
        },

        methods: {
            changeTimestamp(e){
                let ts=e.target.value
                this.timestamp = ts
                if(this.unit === "s"){
                    ts = ts*1000
                }
               let date = new Date(Number(ts))
                if(isNaN(date.getFullYear())){
                    this.date = date.toString()
                }else{
                    let s = `${this.fixed(date.getFullYear(),4)}-${ this.fixed(date.getMonth() + 1,2)}-${this.fixed(date.getDate(),2)} ${this.fixed(date.getHours(),2)}:${this.fixed(date.getMinutes(),2)}:${this.fixed(date.getSeconds(),2)}`
                    let mill = date.getMilliseconds()
                    if(mill>0){
                        s = s + "." +  this.fixed(mill,3)
                    }
                    this.date = s
                }
            },
            changeUnit(e){
                let now = e.target.value
                let prev = this.unit
                if(now === prev){
                    return
                }
                this.unit = now
                this.updateDate(this.date)
            },
            changeDate(e){
                this.updateDate(e.target.value)
            },
            updateDate(val){
                this.timestamp = ""
                this.date = val
                if(val){
                    let t = new Date(val + " GMT+08:00").getTime()
                    if(this.unit === "s"){
                        t = t/1000
                    }
                    this.timestamp = t
                }
            },
            fixed(s,m){
                if(s==null){
                    return ""
                }
                if(s.constructor!==String){
                    s = s.toString()
                }
                if(s.length > m){
                    return s.substring(0,m)
                }else if(s.length < m){
                    return "0".repeat(m - s.length) + s
                }
                return s
            },
            parseMinutes(hourAndMinute){
                if(!hourAndMinute){
                    return NaN
                }
                let s=hourAndMinute.split(":",2)
                if(s.length!==2){
                    return NaN
                }
                let h = Number(s[0])
                if(h<0||h>=24){
                    return NaN
                }
                let m = Number(s[1])
                if(m<0 || h>=60){
                    return NaN
                }
                return h*60 + m
            },
            toHourAndMinute(minutes){
                return `${(minutes/60).toFixed(0)}h${minutes%60}m`
            }
        },
        mounted() {
        }
    }
</script>

<style scoped>

</style>
