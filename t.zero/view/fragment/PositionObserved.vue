<script>
import { VContainer, VIcon, VImg } from "vuetify/lib/components";

// Lifecycle:
//   render -> mounted ->
//                        beforeUpdate
//                        updated
export default {
  props: {},
  data() {
    return {
      els: [undefined], // els is just used to record el, used to escape Vue's watch schema.  A[i]=e isn't watched at all. See here: https://vuejs.org/v2/guide/reactivity.html#For-Arrays
      mounted: false,

      top: undefined,
      left: undefined,
    };
  },
  computed: {},
  created() {},
  mounted() {
    this.mounted = true;

    const el = this.els[0];
    // console.log("elm:", this.el.elm);

    // on mount
    const elm = el.elm;
    const top = elm.offsetTop;
    const left = elm.offsetLeft;
    const height = elm.offsetHeight;
    const width = elm.offsetWidth;

    this.$emit("change", {
      top,
      left,
      height,
      width,
    });
  },
  beforeUpdate() {
    // console.log("overlap beforeUpdate");
  },
  updated() {
    // console.log("overlap updated");
  },
  // gives position
  methods: {},
  render() {
    // do not do
    // console.log("overlap render");
    let el = this.$scopedSlots.default({});
    if (Array.isArray(el)) {
      if (el.length === 0) {
        return undefined;
      }
      if (el.length > 1) {
        throw new Error("Overlap only accepts single element");
      }
      el = el[0];
    }
    if (!el) {
      return undefined;
    }
    this.els[0] = el;
    return el;
  },
};
</script>
