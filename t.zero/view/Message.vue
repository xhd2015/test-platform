<script>
import { VBtn, VProgressCircular, VSnackbar } from "vuetify/lib/components";

import lodash from "lodash";
import { resolveFunctional } from "@fultonjs/common/lib/promise";

// a tag selector, with builtin repeation-free
// emit:
//    dismiss
export default {
  name: "Message",
  props: {
    message: {
      type: String,
      description: "message",
    },
    type: {
      type: String,
      default: "info",
      description: "type of this message:info, warn, error",
    },
    loading: {
      type: Boolean,
      default: false,
      description: "whether show the loading icon",
    },
    // when close==true, timeout has no effect
    timeout: {
      type: Number,
      description:
        "timeout ms, if no timeout,no action and no close present, a default timeout 3000ms will take effective; if timeout is -1, nevern timeout",
    },
    close: {
      type: Boolean,
      description: "show close button",
    },
    // waiting
    action: {
      type: [Function, Promise],
      description: "a promise,after done,the message will be closed",
    },
    actionLeastLast: {
      type: Number,
      default: 200,
      description: "the minimal timeout for the action",
    },
  },
  data() {
    return {
      colorMapping: {
        info: "primary", // default
        warn: "orange",
        error: "red",
      },
      show: true,
    };
  },
  computed: {
    messageColor() {
      return this.colorMapping[this.type] || this.colorMapping.info;
    },
  },
  created() {
    if (this.action) {
      Promise.all([
        new Promise((resolve) => setTimeout(resolve, this.actionLeastLast)), // at least 1000ms,
        resolveFunctional(this.action),
      ]).finally(() => {
        this.show = false;
      });
    }
  },
  watch: {
    show(value) {
      if (!value) {
        this.$emit("dismiss");
      }
    },
  },
  methods: {},
  render() {
    return (
      <VSnackbar
        timeout={
          this.timeout === undefined && !this.action && !this.close
            ? 3000
            : this.timeout > 0
            ? this.timeout
            : 600 * 1000 /* infinite*/
        }
        vModel={this.show}
        color={this.messageColor}
        absolute
        top
        text
        centered
        style={{ zIndex: 10 }}
        scopedSlots={{
          ...(this.close && {
            action: (attrs) => (
              <VBtn
                {...{ attrs }}
                color="pink"
                text
                onClick={() => {
                  this.show = false;
                }}
              >
                Close
              </VBtn>
            ),
          }),
        }}
      >
        <div class="d-flex justify-start align-center">
          {this.loading && (
            <VProgressCircular
              indeterminate
              color="primary mr-4"
            ></VProgressCircular>
          )}
          <span>{this.message}</span>
        </div>
      </VSnackbar>
    );
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
