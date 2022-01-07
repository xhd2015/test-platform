
<script>
import { VContainer } from "vuetify/lib/components";
import Message from "./Message.vue";

// A message queue
// emit:
//    dismiss
export default {
  name: "Messages",
  props: {},
  data() {
    return {
      message: null,
      queue: [], // message to be shown
      //   messages: [],
    };
  },
  computed: {},
  created() {},
  watch: {},
  methods: {
    /**
     * @public
     * @param message a string or {message, timeout,close,type}
     */
    // add(message) {
    //   if (typeof message === "string") {
    //     message = { message };
    //   }
    //   this.messages.push({ message, show: true });
    // },
    /**
     * @public
     * @param message a string
     * @param { timeout,close,type}
     */
    push(message, options) {
      if (!message) {
        return;
      }
      if (!this.message) {
        this.message = { message, ...options };
        return;
      }
      this.queue.push({ message, ...options });
    },
    next() {
      this.message = null;
      setTimeout(() => {
        if (this.queue.length > 0) {
          this.message = this.queue.splice(0, 1)[0];
        }
      }, 100);
    },
  },
  render() {
    return (
      <VContainer>
        {this.message && (
          <Message {...{ attrs: this.message }} onDismiss={() => this.next()} />
        )}
      </VContainer>
    );
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
