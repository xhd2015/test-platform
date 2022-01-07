<script>
// import { ResultArea } from "../fragment";
// import { stringify } from "../../util/json";
// import { setWindowContentChanged } from "../util/window";
// import * as logParseUtils from "@fultonjs/common/src/log-parse";
// import { debounce } from "@fultonjs/common/src/lodash-utils";
import lodash from "lodash";

import {
  VContainer,
  VRow,
  VCol,
  VTextarea,
  VBtn,
  VIcon,
  VImg,
  VCheckbox,
  VSelect,
  VTextField,
  VSwitch,
  VSnackbar,
  VTooltip,
  VCombobox,
} from "vuetify/lib/components";

export default {
  name: "DataSource",
  props: {
    type: {},
    name: {},
    data: {},
  },
  data() {
    return {
      myType: "plain",
      myName: "",
      myData: "{}",
    };
  },

  methods: {
    // describe the target, not the source
    clickDelete() {
      this.$emit("delete");
    },
  },

  computed: {
    // fileDisabled() {
    //   return !this.fileLink;
    // },
  },
  watch: {
    // endpoint() {
    //   this.debounceUpdatePodDetail();
    // },
  },

  created() {
    const emitChange = (type, name, data) => {
      this.$emit("change", { type, name, data });
    };
    this.$watch("type", (val) => (this.myType = val), { immediate: true });
    this.$watch("name", (val) => (this.myName = val), { immediate: true });
    this.$watch("data", (val) => (this.myData = val), { immediate: true });
    this.$watch("myType", (val) => emitChange(val, this.myName, this.myData));
    this.$watch("myName", (val) => emitChange(this.myType, val, this.myData));
    this.$watch("myData", (val) => emitChange(this.myType, this.myName, val));
    // this.debounceUpdateEndpoints = lodash.debounce(this.updateEndpoints, 200);
    // immediately call
    // this.debounceUpdateEndpoints();
  },
  mounted() {},

  render() {
    // 1. many configurations can be implied by service name,so hide them
    // 2. in the future, add request randomization
    return (
      <VContainer class="root">
        <VTextField label="Name" vModel={this.myName} />
        <VSelect label="Type" vModel={this.myType} items={["plain"]} />
        <VTextarea label="Data" outlined rows={5} vModel={this.myData} />
        <VBtn type="warn" outlined small onClick={() => this.clickDelete()}>
          Delete
        </VBtn>
      </VContainer>
    );
  },
};
</script>

<style scoped>
.col {
  padding-left: 0;
}
.root {
  padding: 2px;
  border: 1px solid;
}
</style>
