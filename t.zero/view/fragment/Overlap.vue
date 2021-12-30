<script>
import { VContainer, VIcon, VImg } from "vuetify/lib/components";
import { PositionObserved } from "./index";

// Lifecycle:
//   render -> mounted ->
//                        beforeUpdate
//                        updated
export default {
  props: {
    value: {
      // any type to be string
    },
  },
  data() {
    return {
      els: [undefined], // els is just used to record el, used to escape Vue's watch schema.  A[i]=e isn't watched at all
      mounted: false,

      top: undefined,
      left: undefined,
    };
  },
  computed: {},
  created() {},
  mounted() {
    console.log("overlap mounted");
    this.mounted = true;
    window.ddd_overlap_mounted = this.els[0];

    const el = this.els[0];
    // console.log("elm:", this.el.elm);

    // on mount
    const elm = el.elm;
    const top = elm.offsetTop;
    const left = elm.offsetLeft;

    this.$emit("change", {
      top,
      left,
    });
  },
  beforeUpdate() {
    console.log("overlap beforeUpdate");
  },
  updated() {
    console.log("overlap updated");
  },
  // gives position
  methods: {},
  render() {
    if (true) {
      return [
        <PositionObserved>{this.$scopedSlots.default({})}</PositionObserved>,
      ];
    }

    // do not do
    console.log("overlap render");
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
    // if (this.el !== el) {
    //   console.log("el changed");
    // }
    // this.el = el;

    // // elm not yet created
    // const htmlElm = el.elm;
    // if (htmlElm instanceof Text) {
    //   console.warn(
    //     "cannot set overlap on Text, the way to get its position is not stable."
    //   );
    //   return htmlElm;
    // }
    // console.log("not Text");

    // window.ddd_overlap_el = el;

    return el;

    // window.ddd_overlap = this;
    // return (
    //   <div>
    //     {
    //       //  XXXX1
    //       //         <div>
    //       //           {[this.$scopedSlots.e({}), <span>AAA;</span>, this.$slots.default]}
    //       //         </div>
    //     }
    //     XXXX2
    //     <VContainer>
    //       {[this.$scopedSlots.e({}), <span>AAA;</span>, this.$slots.default]}
    //     </VContainer>
    //   </div>
    // );
  },
};
</script>
