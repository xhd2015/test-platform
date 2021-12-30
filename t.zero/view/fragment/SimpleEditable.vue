<script>
import { VIcon, VImg } from "vuetify/lib/components";

import { bindWatch, bindEmit } from "../../util/vueutil";

export default {
  props: {
    value: {
      // any type to be string
    },
    validate: {
      type: Function, // a validator
    },
    editable: {
      type: [Object, Boolean], // is editable
      default: true,
    },
  },
  data() {
    return {
      mValue: "",
      initValue: "",
    };
  },
  computed: {
    element() {
      return this.$slots.default[0];
    },
  },
  created() {
    bindWatch(this, "value", "mValue");
    bindEmit(this, "mValue", "input");

    // initial editable
    this.$watch(
      "editable",
      (e) => {
        if (this.element.elm) {
          this.element.elm.contentEditable = e;
        }
      },
      { immediate: true }
    );
    this.initValue = this.value;
    console.log("value is:", this.value)
    // at this point, elm is not created
    // this.element.elm.innerText = this.value;
  },
  mounted() {
    this.element.elm.innerText = this.initValue;
    this.element.elm.onblur = () => {
      if (this.validate) {
        (async () => await this.validate())().catch((e) => {
          this.$emit("validateError", e);
        });
      }
    };
    this.element.elm.oninput = (e) => {
      this.mValue = e.target.innerText;
    };

    // set init value
    this.element.elm.contentEditable = this.editable;
  },
  methods: {
    setValue(v) {
      this.element.elm.innerText = v;
    },
  },
  render() {
    return this.element;
  },
};
</script>
