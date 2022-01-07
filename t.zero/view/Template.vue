<script>
import { ResultArea } from "../fragment";
import { stringify } from "../../util/json";
import { setWindowContentChanged } from "../util/window";
import * as logParseUtils from "@fultonjs/common/src/log-parse";
import { debounce } from "@fultonjs/common/src/lodash-utils";
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
  name: "Template",
  props: {
    type: {},
    data: {},
  },
  data() {
    return {
      myType: "plain",
      myData: "{}",
    };
  },

  methods: {
    // describe the target, not the source
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
    // this.debounceUpdateEndpoints = lodash.debounce(this.updateEndpoints, 200);
    // immediately call
    // this.debounceUpdateEndpoints();
  },
  mounted() {},

  render() {
    // 1. many configurations can be implied by service name,so hide them
    // 2. in the future, add request randomization
    return (
      <div>
        <VSelect label="Type" vModel={this.myType} items={["plain"]} />
        <VTextarea vModel={this.myData} />
      </div>
    );
  },
};
</script>

<style scoped>
.col {
  padding-left: 0;
}
</style>
