<script>
// import { ResultArea } from "./fragment";
// import { decodeArrayToString } from "../util/strings";
// import { loadExcel, toExcel } from "../util/excel";
// import { stringify } from "../util/json";
// import { chooseFileToSave, chooseFileToRead, CONTENT_JSON } from "../util/file";
// import { setWindowContentChanged } from "../util/window";
// import * as logParseUtils from "@fultonjs/common/src/log-parse";
// import { debounce } from "@fultonjs/common/src/lodash-utils";
import lodash from "lodash";
// import * as config from "../config/stub";
// import { api, message, copy } from "../support";

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

import Party from "./Party.vue";

export default {
  name: "DataComposerEditor",
  props: {
    name: {
      description: "identifying name",
    },
    parties: {
      description: "",
    },
    composer: {
      type: String,
      default: `function(data){
    return {}
}`,
      description: "our composer",
    },
  },
  data() {
    return {
      myName: "",
      myParties: [],
      myComposer: "",
    };
  },

  methods: {
    clickAdd() {
      this.myParties = this.myParties || [];
      this.myParties.push({});
    },
  },
  computed: {},
  watch: {},
  created() {
    const emitChange = (name, parties, composer) => {
      this.$emit("change", { name, parties, composer });
    };
    // this.debounceUpdateEndpoints = lodash.debounce(this.updateEndpoints, 200);
    // immediately call
    // this.debounceUpdateEndpoints();
    this.$watch("name", (val) => (this.myName = val), { immediate: true });
    this.$watch("parties", (val) => (this.myParties = val), {
      immediate: true,
    });
    this.$watch("composer", (val) => (this.myComposer = val), {
      immediate: true,
    });
    this.$watch("myName", (val) =>
      emitChange(val, this.myParties, this.composer)
    );
    this.$watch("myParties", (val) =>
      emitChange(this.myName, val, this.composer)
    );
    this.$watch("myComposer", (val) =>
      emitChange(this.myName, this.myParties, val)
    );
  },
  mounted() {},

  render() {
    // 1. many configurations can be implied by service name,so hide them
    // 2. in the future, add request randomization
    return (
      <VContainer>
        <VRow>
          <VCol cols="2">
            <VTextField label="Name" vModel={this.name} />
          </VCol>
        </VRow>

        <VRow>
          <VCol>
            <VTextarea label="Composer" vModel={this.myComposer} outlined />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="2">
            <VBtn outlined small onClick={() => this.clickAdd()}>
              Add Party
            </VBtn>
          </VCol>
        </VRow>

        <VRow>
          <VCol>
            {this.myParties?.map((party, idx) => (
              <Party {...{ attrs: party }} key={idx} />
            ))}
          </VCol>
        </VRow>
      </VContainer>
    );
  },
};
</script>

<style scoped>
.col {
  padding-left: 0;
}

.row2 {
  align-items: baseline;
}
</style>
