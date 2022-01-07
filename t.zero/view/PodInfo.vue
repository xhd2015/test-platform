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
import * as config from "../config/stub";
import { api, message, copy } from "../support";

import {
  VContainer,
  VRow,
  VCol,
  VTextarea,
  VBtn,
  VIcon,
  VImg,
  VCheckbox,
  VSelect,
  VTextField,
  VSwitch,
  VSnackbar,
  VTooltip,
  VCombobox,
} from "vuetify/lib/components";

export default {
  name: "PodInfo",
  props: [],
  data() {
    return {
      region: config.grpc.defaultRegion,
      env: config.grpc.defaultEnv,
      service: config.grpc.defaultService,
      endpoints: [],
      endpoint: "", // ip:port
      refreshing: false,
      response: null,
      responseError: null,
      showConsole: false,
    };
  },

  methods: {
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
    // above is depercated
    async updateEndpoints() {
      if (this.service === "unset") {
        return;
      }
      this.refreshing = true;
      this.endpoints = [];
      this.endpoint = "";
      this.endpoints = await api
        .listEndpoints({
          region: this.region,
          env: this.env,
          service: this.service,
        })
        .finally(() => {
          this.refreshing = false;
        });
      // reset endpoint
      this.endpoint = this.endpoints?.[0] || "";
    },
    async updatePodDetail() {
      this.responseError = null;
      let endpoint = this.endpoint;
      if (!endpoint) {
        this.responseError = "No pod deployed. Check if the region & env & service matches."
        return;
      }
      endpoint = endpoint.split(":", 2)[0];
      // validate
      const parts = endpoint?.split(".");
      if (parts?.length !== 4) {
        this.responseError = "Invalid endpoint"
        return;
      }
      for (let part of parts) {
        if (!part || isNaN(Number.parseInt(part))) {
          return;
        }
      }
      this.refreshing = true;
      this.response = {
        status: "Loading...",
      };
      const resp = await api
        .getPodInfo({
          region: this.region,
          env: this.env,
          service: this.service === "unset" ? "" : this.service,
          ip: endpoint,
        })
        .finally(() => {
          this.refreshing = false;
        });
      if (!resp) {
        this.response = { status: "Not Found" };
        return;
      }
      this.response = resp;
    },
    clickRefreshEndpoint() {
      this.refreshing = true;
      Promise.all([
        this.debounceUpdateEndpoints()
          .then(async () => {
            await this.debounceUpdateMethods();
          })
          .then(async () => {
            await this.updateRequest();
          }),
        new Promise((resolve) => setTimeout(resolve, 1000)) /* at least 1s*/,
      ]).finally(() => {
        this.refreshing = false;
      });
    },
    clickConsoleEndpoint() {
      copy.showCopy(this.loginCommand, { timeout: 5 * 1000 });
    },
  },

  computed: {
    consoleDisabled() {
      return !(
        this.region &&
        this.env &&
        this.service &&
        this.endpoint &&
        !this.endpoint?.startsWith("localhost") &&
        !this.endpoint.startsWith("127.0.0.1")
      );
    },
    fileDisabled() {
      return !this.fileLink;
    },
    loginCommand() {
      return `bash -c "script -q /dev/null bash <(curl -s 'http://10.12.208.244:8000/pod/login?region=${
        this.region
      }&env=${this.env}&service=${
        this.service === "unset" ? "" : this.service
      }&endpoint=${this.endpoint}')"`;
    },
  },
  watch: {
    env() {
      this.debounceUpdateEndpoints();
    },
    region() {
      this.debounceUpdateEndpoints();
    },
    service() {
      this.debounceUpdateEndpoints();
    },
    endpoint() {
      this.debounceUpdatePodDetail();
    },
  },

  created: function () {
    this.debounceUpdateParsedLog = lodash.debounce(this.updateParsedLog, 200);
    this.debounceUpdateEndpoints = lodash.debounce(this.updateEndpoints, 200);
    this.debounceUpdatePodDetail = lodash.debounce(this.updatePodDetail, 200);

    // immediately call
    // this.debounceUpdateEndpoints();
    // this.debounceUpdateProtoServices();
    this.debounceUpdateEndpoints();
  },
  mounted() {},

  render() {
    // 1. many configurations can be implied by service name,so hide them
    // 2. in the future, add request randomization
    return (
      <VContainer>
        <VRow>
          <VCol cols="1">
            <VSelect
              label="Region"
              vModel={this.region}
              items={config.grpc.regions}
            />
          </VCol>

          <VCol cols="2">
            <VSelect label="Env" vModel={this.env} items={config.grpc.envs} />
          </VCol>

          <VCol cols="3">
            <VSelect
              label="Service"
              vModel={this.service}
              items={["unset", ...config.grpc.services]}
            />
          </VCol>

          <VCol cols="4">
            <VCombobox
              label="IP"
              vModel={this.endpoint}
              items={this.endpoints}
            />
          </VCol>

          <VCol cols="1" style={{ display: "flex", placeSelf: "center" }}>
            <VBtn
              onClick={() => this.clickRefreshEndpoint()}
              small
              outlined
              loading={this.refreshing}
            >
              <VIcon small>mdi-refresh</VIcon>
            </VBtn>

            <VBtn
              onClick={() => this.clickConsoleEndpoint()}
              small
              outlined
              class="ml-1"
              disabled={this.consoleDisabled}
            >
              <VIcon small>mdi-console</VIcon>
            </VBtn>
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <ResultArea
              text={stringify(this.response)}
              error={this.responseError}
              pureJson={true}
              ref="result"
              inputMayNotBeJsExpr={true}
              // autoGrow
              rows={20}
              hideFilterOption
              hideJsonFilter
              hideCommonOptions
              filterMode="jsEval"
              label="Pod Detail"
            ></ResultArea>
          </VCol>
        </VRow>
      </VContainer>
    );
  },
};
</script>

<style scoped>
.col {
  padding-left: 0;
}
</style>
