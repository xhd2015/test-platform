<!--A ResultArea renders json results in a pretty printed mode-->
<script>
// import * as codeUtils from "@fultonjs/common/src/code"
import * as jsonUtils from "../../util/json";
import { updateTextareaHeight } from "../../util/document";
import lodash from "lodash";
// import {}
import {
  VContainer,
  VRow,
  VCol,
  VTextarea,
  VBtn,
  VIcon,
  VImg,
  VTextField,
  VSelect,
  VCheckbox,
} from "vuetify/lib/components";

export default {
  name: "ResultArea",
  components: {},
  // inputMayNotBeJsExpr:  the input may not be a javascript expression
  // default:false
  // why this option?  allow integer as key
  // but it has a drawback: big numbers not be precisely represented because js uses float to store number

  props: {
    error: {
      description: "if error is given, it is shown",
    },
    text: {
      description: "the text, ",
    },
    possibleJson: {
      // type:Boolean
      description: "is it possible to be json",
    },
    hideJsonFilter: {},
    hideCommonOptions: {
      // type:Boolean
      description: "whether hide common options",
    },
    pureJson: {
      // type:Boolean,
      description:
        "is it pure json? if so, the text can also be an object rather than string",
    },
    inputMayNotBeJsExpr: {},
    filterMode: {
      type: String, // jsEval,
      default: "jsEval",
    },
    hideFilterOption: {
      // type:Boolean,
    },
    autoGrow: { description: "result area auto grow" },
    outlined: {
      default: true,
      description: "show outline",
    },
    label: {
      type: String,
      description: "label",
    },
  },
  data() {
    return {
      keyPath: "",
      cachedText: "",
      internalError: "",
      evaluationScript: "",
      mFilterMode: "jsEval",
      compress: false,
      showKeys: false,
      filteredText: "",
      areaText: "",
    };
  },

  created: function () {
    this.debouncedUpdateArea = lodash.debounce(this.updateArea, 200);
    this.$watch("filterMode", () => (this.mFilterMode = this.filterMode), {
      immediate: true,
    });
  },
  methods: {
    updateArea() {
      this.internalError = "";
      let area = this.$refs.resultArea;
      this.updateFilterText();
      let text = this.filteredText;
      if (this.error) {
        this.areaText = this.error;
      } else if (this.internalError) {
        this.areaText = this.internalError;
      } else {
        this.areaText = text;
      }
      this.cachedText = this.filteredText;

      // shit on this: wasted my time to diagnose why the
      // textarea grow inside but will stack on others.
      // updateTextareaHeight(area.$el);
    },
    getText() {
      return this.text;
    },
    /**
     * if error exists, not data is returned
     * @return {*}
     */
    getCurrentText() {
      return this.hasError ? null : this.filteredText;
    },
    updateFilterText() {
      this.filteredText = this.computeFilterText();
    },

    computeFilterText() {
      if (this.error) {
        return this.text;
      }
      if (!this.maybeJson) {
        return this.text;
      }
      let obj;
      if (this.pureJson) {
        if (!this.text) {
          return "";
        }
        try {
          if (this.inputMayNotBeJsExpr) {
            obj = jsonUtils.parse(this.text);
          } else {
            obj = jsonUtils.evaluateObject(this.text);
          }
        } catch (e) {
          this.internalError = e.message || e.toString();
          return this.cachedText;
        }
      } else {
        obj = jsonUtils.getPossibleJSONObject(
          this.text,
          this.inputMayNotBeJsExpr
        );
        if (obj == null) {
          return this.text;
        }
      }
      // // JSON String is parsed for twice
      // if (obj.constructor === String && obj.startsWith("\"")) {
      //     let tmpObj = jsonUtils.getPossibleJSONObject(obj)
      //     if (tmpObj == null) {
      //         return obj
      //     }
      //     obj = tmpObj
      // }
      // if (obj != null && obj.constructor === String) {
      //     return obj
      // }
      // if (!obj) {
      // cur = obj
      // } else {
      let cur = obj;
      if (this.mFilterMode === "jsonPath") {
        let arr = this.keyPath.split(/\.|(?=\[)/);
        if (arr.length === 1 && arr[0] === "") {
          arr = [];
        }
        try {
          cur = jsonUtils.getJsonPath(obj, arr);
        } catch (e) {
          if (this.possibleJson) {
            return this.cachedText;
          } else {
            this.internalError = e.message || e.toString();
            return this.cachedText;
          }
        }
      } else if (this.mFilterMode === "jsEval") {
        if (this.evaluationScript) {
          let f;
          try {
            //
            f = eval("(function(){ return (" + this.evaluationScript + ");})");
          } catch (e) {
            this.internalError =
              "Evaluation script compile error:" + e.toString();
            return this.cachedText;
          }
          try {
            cur = f.bind(obj)(obj);
            console.log("fn:", cur);
            if (typeof cur === "function") {
              cur = cur.bind(obj)(obj);
            }
          } catch (e) {
            this.internalError =
              "Evaluation script execution error:" +
              (e.message || e.toString());
            return this.cachedText;
          }
        }
      }
      let compress = this.compress;
      return jsonUtils.formatPossibleJSON(cur, {
        compress,
        keys: this.showKeys,
      });
    },
  },
  computed: {
    hasError() {
      return !!(this.error || this.internalError);
    },
    maybeJson() {
      return this.pureJson || this.possibleJson;
    },
    showJsonOptions() {
      return this.maybeJson && !this.hideJsonFilter;
    },
  },
  watch: {
    error() {
      this.debouncedUpdateArea();
    },
    text() {
      this.debouncedUpdateArea();
    },
    keyPath() {
      this.debouncedUpdateArea();
    },
    maybeJson() {
      this.debouncedUpdateArea();
    },
    evaluationScript() {
      this.debouncedUpdateArea();
    },
    mFilterMode() {
      this.debouncedUpdateArea();
    },
    compress() {
      this.debouncedUpdateArea();
    },
    showKeys() {
      this.debouncedUpdateArea();
    },
  },
  updated() {},

  mounted() {},
  beforeDestroy() {},
  render() {
    return (
      <VContainer class="ma-0 pa-0">
        {this.showJsonOptions && [
          !this.hideFilterOption && (
            <VRow>
              <VCol cols="6" md="4">
                <VSelect
                  vModel={this.mFilterMode}
                  items={[
                    { value: "jsEval", text: "JS Eval" },
                    { value: "jsonPath", text: "JSON Path" },
                  ]}
                  itemText="text"
                  itemValue="value"
                  label="Filter Mode"
                />
              </VCol>
            </VRow>
          ),

          this.mFilterMode === "jsEval" && (
            <VRow>
              <VCol cols="12" class="pb-0 mb-0">
                <VTextarea
                  class="pb-0 mb-0"
                  placeholder="key"
                  vModel={this.evaluationScript}
                  rows={1}
                  label="Filter"
                  hint="js filter,e.g.: this.a"
                  outlined={this.outlined}
                />
              </VCol>
            </VRow>
          ),

          this.mFilterMode === "jsonPath" && (
            <VRow>
              <VCol cols="12" class="pt-0 ma-0">
                <VTextarea
                  class="pt-0 ma-0"
                  placeholder="this.key.data[0].value"
                  label="Filter"
                  autoGrow
                  rows={1}
                  dense
                  vModel={this.keyPath}
                  outlined={this.outlined}
                />
              </VCol>
            </VRow>
          ),

          // <input type="checkbox" /><label>Unwrap String as JSON</label>
        ]}
        {!this.hideCommonOptions && (
          <VRow>
            <VCol cols="3" class="pt-0" style={{ display: "flex" }}>
              <VCheckbox
                inputValue={this.showKeys}
                onChange={(checked) => {
                  if (checked) {
                    this.compress = true;
                  } else {
                    this.compress = false;
                  }
                  this.showKeys = checked;
                }}
                label="Show Keys"
                class="pt-0"
                hideDetails
              />
            </VCol>
            <VCol cols="3" class="pt-0">
              <VCheckbox
                hideDetails
                vModel={this.compress}
                label="Compress"
                class="pt-0"
              />
            </VCol>
          </VRow>
        )}
        <VRow>
          <VCol cols="12" class="pt-0">
            <VTextarea
              outlined={this.outlined}
              ref="resultArea"
              vModel={this.areaText}
              readonly
              error={this.hasError}
              autoGrow={!!this.autoGrow}
              label={this.label}
            ></VTextarea>
          </VCol>
        </VRow>
      </VContainer>
    );
  },
};
</script>

<style scoped>
.message-box2 {
  display: block;
  height: auto;
  overflow: auto;
  margin: 0;
  font-family: Courier New, sans-serif;
  border: none;
  box-shadow: none;
  background-color: #f0f0f0;
  width: 100%;
  padding: 6px 12px;
  border-radius: 4px;
}

.message-box-error {
  color: #900;
  background-color: #fee;
}
/* .v-textarea--auto-grow{
  height: fit-content;
} */
</style>
