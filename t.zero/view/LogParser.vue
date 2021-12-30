<script>
import { ResultArea } from "./fragment";
import { decodeArrayToString } from "../util/strings";
import { loadExcel, toExcel } from "../util/excel";
import { stringify } from "../util/json";
import { chooseFileToSave, chooseFileToRead, CONTENT_JSON } from "../util/file";
import { setWindowContentChanged } from "../util/window";
import * as logParseUtils from "@fultonjs/common/src/log-parse";
import { debounce } from "@fultonjs/common/src/lodash-utils";
import lodash from "lodash";

import {
  VContainer,
  VRow,
  VCol,
  VTextarea,
  VBtn,
  VIcon,
  VImg,
  VCheckbox,
} from "vuetify/lib/components";

export default {
  name: "LogParser",
  props: [],
  data() {
    return {
      strictParse: false,
      log: "",
      parsedLog: [],
      parseError: "",
    };
  },

  methods: {
    saveJson() {
      chooseFileToSave(this.result, "file.json", CONTENT_JSON);
    },
    saveExcel() {
      toExcel(JSON.parse(this.result), "file.xlsx");
    },
    // describe the target, not the source
    updateParsedLog() {
      this.parseError = "";
      if (!this.strictParse) {
        this.parsedLog = logParseUtils.tryParseAll(this.log);
        return;
      }
      try {
        this.parsedLog = logParseUtils.parseOne(this.log);
      } catch (e) {
        this.parseError = e.message;
      }
    },
  },

  computed: {
    result() {
      return this.$refs.result.getCurrentText();
    },
  },
  watch: {
    log() {
      this.debounceUpdateParsedLog();
    },
    strictParse() {
      this.debounceUpdateParsedLog();
    },
  },

  created: function () {
    this.debounceUpdateParsedLog = lodash.debounce(this.updateParsedLog, 200);
  },

  render() {
    return (
      <VContainer class="pl-2">
        <VRow>
          <VCol cols="12" class="pa-0">
            <VTextarea
              outlined
              class="pa-0"
              style={{ width: "100%", height2: "200px" }}
              vModel={this.log}
              placeholder="log"
              label="Log"
            />
          </VCol>
        </VRow>

        <VRow>
          <VCheckbox
            inputValue={this.showKeys}
            onChange={(checked) => {
              this.strictParse = checked;
            }}
            label="strict"
            class=""
            hideDetails
          />
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
              text={stringify(this.parsedLog)}
              error={this.parseError}
              pureJson={true}
              ref="result"
              inputMayNotBeJsExpr={true}
              autoGrow={true}
              hideFilterOption
              filterMode="jsEval"
              label="Result"
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
