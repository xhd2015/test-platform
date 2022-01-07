<script>
import {
  toYYYYmmdd,
  toYYYYmmdd_HHMMSS,
  toYYYYmmddHHMMSS_NoSep,
} from "@fultonjs/common/src/date-utils";

import { setClipboard } from "../util/clipboard";

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
import TextFieldAppend from "./fragment/TextFieldAppend.vue";

export default {
  name: "Time",
  props: {
    type: {},
    data: {},
  },
  data() {
    return {
      myType: "plain",
      myData: "{}",
      milliseconds: 0,
      updater: null,
    };
  },

  methods: {
    // describe the target, not the source
  },

  computed: {
    // fileDisabled() {
    //   return !this.fileLink;
    // },
    seconds() {
      return Math.floor(this.milliseconds / 1000);
    },
    jsDate() {
      return new Date(this.milliseconds);
    },
    YYYYmmdd() {
      return toYYYYmmdd(this.jsDate);
    },
    YYYYmmdd_HHMMSS() {
      return toYYYYmmdd_HHMMSS(this.jsDate);
    },
    YYYYmmdd_HHMMSS_fs() {
      return toYYYYmmddHHMMSS_NoSep(this.jsDate);
    },
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
    this.updater = setInterval(() => {
      this.milliseconds = Date.now();
    }, 100);
  },
  mounted() {},

  beforeDestroy() {
    if (this.updater) {
      clearInterval(this.updater);
      this.updater = null;
    }
  },

  render() {
    // 1. many configurations can be implied by service name,so hide them
    // 2. in the future, add request randomization
    return (
      <div>
        {[
          ["Millisecond", this.milliseconds],
          ["Second", this.seconds],
          ["Date", this.YYYYmmdd],
          ["Datetime", this.YYYYmmdd_HHMMSS],
          ["Datetime(compact)", this.YYYYmmdd_HHMMSS_fs],
        ].map(([label, val]) => (
          <TextFieldAppend
            readonly
            value={val}
            label={label}
            appendProps={{ val }}
            scopedSlots={{
              append: ({ val }) => (
                <VIcon
                  onClick={() => {
                    setClipboard(val);
                  }}
                >
                  mdi-content-copy
                </VIcon>
                // </VBtn>
              ),
            }}
          ></TextFieldAppend>
        ))}
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
