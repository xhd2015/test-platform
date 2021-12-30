<script>

import {
 VIcon,
  VImg,
} from "vuetify/lib/components";

export default {
    props:{
        setIcon:{
            type:String
        },
        unsetIcon:{
            type:String
        },
        value:{
            type:[Object,Boolean], // or Boolean
            description:"is set"
        }
    },
    data(){
        return {
            mValue:false
        }
    },
    created(){
        this.mValue = this.value
    },
    render(){
        return <VIcon onClick={()=>{
            this.mValue = !this.mValue
            this.$emit("input", this.mValue)
        }}
        // right
        // dense
        // light
        >{this.mValue ? this.setIcon : this.unsetIcon}</VIcon>
    }
}
</script>
