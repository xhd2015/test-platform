<script>
import { ResultArea } from "./fragment";
import { decodeArrayToString } from "../util/strings";
import { loadExcel, toExcel } from "../util/excel";
import { stringify } from "../util/json";
import { chooseFileToSave, chooseFileToRead, CONTENT_JSON } from "../util/file";
import { setWindowContentChanged } from "../util/window";

import {
  VContainer,
  VRow,
  VCol,
  VTextarea,
  VBtn,
  VIcon,
  VImg,
} from "vuetify/lib/components";

export default {
  name: "JSONPretty",
  props: [],
  data() {
    return {
      text: "",
    };
  },

  methods: {
    load() {
      let _this = this;
      chooseFileToRead(
        function (result, filename) {
          let text;
          if (filename.name.endsWith(".json")) {
            text =
              result.constructor === String
                ? result
                : decodeArrayToString(result);
          } else {
            text = stringify(loadExcel(result), null, "    ");
          }
          _this.text = text;
        },
        { binary: true, accept: ".json,.xls,.xlsx" }
      );
    },
    saveJson() {
      chooseFileToSave(this.result, "file.json", CONTENT_JSON);
    },
    saveExcel() {
      toExcel(JSON.parse(this.result), "file.xlsx");
    },
  },

  computed: {
    result() {
      return this.$refs.result.getCurrentText();
    },
  },
  watch: {
    text() {
      setWindowContentChanged();
    },
  },

  created: function () {},

  render() {
    return (
      <VContainer>
        <VRow>
          <VCol class="d-flex" style={{ alignItems: "flex-end" }}>
            <VBtn small dense onClick={() => this.load()}>
              Load...
            </VBtn>
          </VCol>
        </VRow>

        <VRow>
          <VCol cols="12" class="pa-0">
            <VTextarea
              outlined
              style={{ width: "100%", height2: "200px" }}
              vModel={this.text}
              placeholder="json content"
              label="JSON Text"
            />
          </VCol>
        </VRow>

        <VRow>
          <VCol style={{ textAlign: "left" }} class="pa-0">
            <VBtn small dense onClick={() => this.saveJson()} class="mr-1">
              Save JSON
            </VBtn>
            <VBtn small dense onClick={() => this.saveExcel()}>
              Save Excel
            </VBtn>
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <ResultArea
              text={this.text}
              pureJson={true}
              ref="result"
              inputMayNotBeJsExpr={true}
              autoGrow={false}
              hideFilterOption
              filterMode="jsEval"
              autoGrow
            ></ResultArea>
          </VCol>
        </VRow>
      </VContainer>
    );
  },
};
</script>

<style scoped>
</style>
