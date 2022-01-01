
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
      messages: [],
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
      this.messages.push({ message, ...options });
    },
    messageDismiss(model) {
      let idx = this.messages.indexOf(model);
      if (idx !== -1) {
        this.messages.splice(idx, 1);
      }
    },
  },
  render() {
    return (
      <VContainer>
        {this.messages?.map((model) => (
          <Message
            {...{ attrs: model }}
            onDismiss={() => this.messageDismiss(model)}
          />
        ))}
      </VContainer>
    );
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
