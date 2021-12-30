<script>
import { VIcon, VImg, VTextField } from "vuetify/lib/components";

import { bindWatch, bindEmit } from "../../util/vueutil";
import { isEmpty } from "@fultonjs/common/src/string";

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
      editValue: "",
      inEdit: false,
      savedDisplay: "",
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

    this.$watch("mValue", (e) => this.updateElementValue());

    // initial editable
    this.$watch(
      "inEdit",
      (e) => {
        this.updateElementDisplay();
      },
      { immediate: true }
    );

    // at this point, elm is not created
    // this.element.elm.innerText = this.value;
  },
  mounted() {
    this.element.elm.innerText = this.mValue;
    this.element.elm.onclick = (e) => {
      if (this.editable) {
        this.inEdit = true;
      }
    };
    this.element.elm.oninput = (e) => {
      this.mValue = e.target.innerText;
    };

    this.savedDisplay = this.element.elm.style.display;
    // set init value
    this.element.elm.contentEditable = this.editable;
  },
  methods: {
    updateElementValue() {
      if (this.element.elm) {
        this.element.elm.innerText = this.mValue;
      }
    },
    updateElementDisplay() {
      if (this.element.elm) {
        if (this.inEdit) {
          this.savedDisplay = this.element.elm.style.display;
          this.element.elm.style.display = "none";
          this.editValue = this.mValue;
        } else {
          this.element.elm.style.display = this.savedDisplay;
        }
      }
    },
  },
  render() {
    return (
      <span>
        {this.element}
        <VTextField
          vModel={this.editValue}
          style={{ display: this.inEdit ? "" : "none" }}
          //   onBlur={(e) => (this.inEdit = false)}
          //   validateOnBlur // not on blur, but on input change
          class="mt-0 pt-0"
          rules={[
            (e) => {
              if (!this.validate) {
                return true;
              }
              const errMsg = this.validate(e);
              return isEmpty(errMsg) ? true : errMsg;
            },
          ]}
          on={{
            "click:append": (e) => {
              const isValid = this.$refs.input.validate(true);
              if (!isValid) {
                return;
              }
              this.inEdit = false;
              this.mValue = this.editValue;
              this.$emit("change", this.mValue);
            },
          }}
          ref="input"
          appendIcon="mdi-check"
        ></VTextField>
      </span>
    );
    // return this.element;
  },
};
</script>
