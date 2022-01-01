<script>
import { VBtn, VProgressCircular, VSnackbar } from "vuetify/lib/components";

import lodash from "lodash";
import { resolveFunctional } from "@fultonjs/common/lib/promise";

// a tag selector, with builtin repeation-free
// emit:
//    dismiss
export default {
  name: "Copy",
  props: {
    text: {},
    waitCopyStatusText: {
      default: "Copy",
    },
    copiedStatusText: {
      default: "Copied",
    },
    timeout: {
      // default:
      description: "dismiss timeout, default: 3s",
    },
  },
  data() {
    return {
      copyStatus: "Copy",
      show: false,
      myText: "",
      myTimeout: null,
    };
  },
  computed: {},
  created() {
    this.myText = this.text;
    this.myTimeout = this.timeout;
    this.copyStatus = this.waitCopyStatusText;
  },
  watch: {
    show(value) {
      if (!value) {
        this.$emit("dismiss");
      }
    },
  },
  methods: {
    /**
     * @public
     */
    showCopy(text, options) {
      this.myText = text;
      this.copyStatus = this.waitCopyStatusText;
      this.myTimeout = options?.timeout;
      this.show = true;
    },
    clickCopy() {
      const input = document.createElement("input");
      // input.style = "display:none";
      input.value = this.loginCommand;
      document.body.append(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      this.copyStatus = this.copiedStatusText;
    },
  },
  render() {
    return (
      <VSnackbar
        vModel={this.show}
        color="blue-grey"
        top
        text
        timeout={this.myTimeout > 0 ? this.myTimeout : 3 * 1000}
        {...{
          scopedSlots: {
            action: (attrs) => (
              <VBtn
                // color="blue"
                small
                outlined
                // v-bind="attrs"
                // click="snackbar = false"
                onClick={() => this.clickCopy()}
              >
                {this.copyStatus}
              </VBtn>
            ),
          },
        }}
      >
        <span>{this.myText}</span>
      </VSnackbar>
    );
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
