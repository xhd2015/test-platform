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
import DataSource from "./DataSource.vue";

export default {
  name: "Party",
  props: {
    name: {},
    dataSource: {
      type: Array,
      description: "sample data,[{type:plain, name, data:{}}]", // you may somehow needs identity
    },
  },
  data() {
    return {
      myType: "plain",
      myDataSource: [],
      myData: "{}",
    };
  },

  methods: {
    // describe the target, not the source
    clickAddDataSource() {
      this.myDataSource.push({
        type: "plain",
      });
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
    const emitChange = (name, dataSource) => {
      this.$emit("change", { name, dataSource: [...(dataSource || [])] });
    };
    // this.debounceUpdateEndpoints = lodash.debounce(this.updateEndpoints, 200);
    // immediately call
    // this.debounceUpdateEndpoints();
    this.$watch("name", (val) => (this.myName = val), { immediate: true });
    this.$watch("dataSource", (val) => (this.myDataSource = [...(val || [])]), {
      immediate: true,
    });
    this.$watch("myName", (val) => emitChange(val, this.dataSource));
    this.$watch("myDataSource", (val) => emitChange(this.myName, val));
  },
  mounted() {},
  render() {
    // 1. many configurations can be implied by service name,so hide them
    // 2. in the future, add request randomization
    return (
      <VContainer class="root">
        <VRow>
          <VCol cols="3">
            <VTextField label="Data Name" vModel={this.myName} />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="2">
            <VBtn outlined small onClick={() => this.clickAddDataSource()}>
              Add Data Source
            </VBtn>
          </VCol>
        </VRow>
        {this.myDataSource?.map((dataSource, idx) => (
          <VRow key={idx}>
            <VCol>
              <DataSource
                {...{ attrs: dataSource }}
                onChange={(v) =>
                  (this.myDataSource = [
                    ...this.myDataSource.slice(0, idx),
                    v,
                    ...this.myDataSource.slice(idx + 1),
                  ])
                }
                onDelete={() => {
                  this.myDataSource.splice(idx, 1);
                }}
              />
            </VCol>
          </VRow>
        ))}
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
  margin-left: 10px;
  padding: 2px;
  border: 1px solid;
}
</style>
