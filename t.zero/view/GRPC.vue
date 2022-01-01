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
} from "vuetify/lib/components";

export default {
  name: "GRPC",
  props: [],
  data() {
    return {
      protobufSrcType: config.grpc.defaultOption,
      protobufSrc: config.grpc.defaultSource,
      branch: config.grpc.defaultBranch,
      region: config.grpc.defaultRegion,
      env: config.grpc.defaultEnv,
      service: config.grpc.defaultService,
      endpoints: [],
      endpoint: "", // ip:port
      strictParse: false,
      log: "",
      refreshing: false,
      requestDoing: false,
      request: "",
      response: null,
      responseError: null,
      parsedLog: [],
      parseError: "",
      protoServices: [],
      protoService: "",
      protoMethods: [],
      protoMethod: "",
      parsedServices: {},
      showAdancedOptions: false,
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
    async updateProtoServices() {
      if (this.protobufSrcType === config.grpc.defaultOption) {
        this.parsedServices = {};
        this.protoServices = [];
        this.protoService = "";

        const path = config.grpc.serviceMappingToProto[this.service];
        if (!path) {
          throw new Error("no path");
        }
        const protoServices = await api.listProtoServices({
          repo: this.protobufSrc,
          branch: this.branch,
          path: path,
        });
        this.parsedServices = protoServices;
        this.protoServices = Object.keys(protoServices);
        this.protoService = this.protoServices?.[0] || "";
        return;
      }
      throw new Error("unhandled");
    },
    async updateProtoMethods() {
      const parsedService = this.parsedServices?.[this.protoService];
      this.protoMethods = Object.keys(parsedService || {});
      this.protoMethod = this.protoMethods?.[0] || "";
    },
    updateRequest() {
      // TODO: remember what we have previously, provide an option to revert
      const parsedMethod =
        this.parsedServices?.[this.protoService]?.[this.protoMethod];
      this.request = stringify(parsedMethod?.request || {}, null, "    ");
    },
    async makeRequest() {
      // let sessionDone = false;
      // let timeout = false;
      this.requestDoing = true;
      // setTimeout(() => {
      //   if (sessionDone) {
      //     return;
      //   }
      //   if (!timeout) {
      //     timeout = true;
      //     this.requestDoing = false;
      //   }
      // }, 5000);

      let proto;
      if (this.protobufSrcType === config.grpc.defaultOption) {
        const path = config.grpc.serviceMappingToProto[this.service];
        if (!path) {
          throw new Error("no path");
        }
        proto = {
          repo: this.protobufSrc,
          branch: this.branch,
          path: path,
        };
      }
      this.responseError = null;
      this.response = null;
      await api
        .requestGRPC({
          service: this.protoService,
          method: this.protoMethod,
          region: this.region,
          env: this.env,
          proto,
          endpoint: this.endpoint,
          request: this.request,
        })
        .then((res) => {
          this.response = res;
        })
        .catch((e) => {
          this.responseError = e;
        })
        .finally(() => {
          // sessionDone = true;
          this.requestDoing = false;
        });
    },
    clickRefreshEndpoint() {
      this.refreshing = true;
      Promise.all([
        this.debounceUpdateEndpoints(),
        this.debounceUpdateProtoServices()
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
    result() {
      return this.$refs.result.getCurrentText();
    },
    requestDisabled() {
      return !(
        this.region &&
        this.env &&
        this.service &&
        this.endpoint &&
        this.protoService &&
        this.protoMethod
      );
    },
    consoleDisabled() {
      return !(this.region && this.env && this.service && this.endpoint);
    },
    fileDisabled() {
      return !this.fileLink;
    },
    fileLink() {
      if (this.protobufSrcType === config.grpc.defaultOption) {
        const path = config.grpc.serviceMappingToProto[this.service];
        if (!path) {
          throw new Error("no path");
        }
        // /-/tree/master/protobuf3
        return `${this.protobufSrc}/-/tree/${this.branch || "master"}/${path}`;
      }
      return ""; // cannot handle
    },
    loginCommand() {
      return `bash -c "script -q /dev/null bash <(curl -s 'http://10.12.208.244:8000/pod/login?region=${this.region}&env=${this.env}&service=${this.service}&endpoint=${this.endpoint}')"`;
    },
  },
  watch: {
    log() {
      this.debounceUpdateParsedLog();
    },
    strictParse() {
      this.debounceUpdateParsedLog();
    },
    env() {
      this.debounceUpdateEndpoints();
    },
    region() {
      this.debounceUpdateEndpoints();
    },
    service: function () {
      this.debounceUpdateEndpoints();
      this.debounceUpdateProtoServices();
    },
    protoService() {
      this.debounceUpdateMethods();
    },
    protoMethod() {
      // when protoMethod gets changed, reload request
      this.updateRequest();
    },
  },

  created: function () {
    this.debounceUpdateParsedLog = lodash.debounce(this.updateParsedLog, 200);
    this.debounceUpdateEndpoints = lodash.debounce(this.updateEndpoints, 200);
    this.debounceUpdateProtoServices = lodash.debounce(
      this.updateProtoServices,
      200
    );
    this.debounceUpdateMethods = lodash.debounce(this.updateProtoMethods, 200);

    // immediately call
    this.debounceUpdateEndpoints();
    this.debounceUpdateProtoServices();
  },
  mounted() {
    this.debounceUpdateEndpoints();
  },

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
              items={config.grpc.services}
            />
          </VCol>

          <VCol cols="4">
            {
              // TODO: goto terminal
            }

            <VSelect
              label="Endpoint"
              vModel={this.endpoint}
              items={this.endpoints}
            />
          </VCol>

          <VCol cols="1" style={{ display: "flex", placeSelf: "center" }}>
            <VTooltip
              top
              openDelay={1.5 * 1000}
              color="primary lighten-1"
              {...{
                scopedSlots: {
                  activator: ({ on, attrs }) => (
                    <VBtn
                      {...attrs}
                      {...{
                        on: { ...on, click: () => this.clickRefreshEndpoint() },
                      }}
                      on={on}
                      small
                      outlined
                      loading={this.refreshing}
                    >
                      <VIcon small>mdi-refresh</VIcon>
                    </VBtn>
                  ),
                },
              }}
            >
              <span>refresh Endpoint &amp; Service(Protobuf)</span>
            </VTooltip>

            <VTooltip
              top
              openDelay={1.5 * 1000}
              color="primary lighten-1"
              {...{
                scopedSlots: {
                  activator: ({ on, attrs }) => (
                    <VBtn
                      {...attrs}
                      {...{
                        on: { ...on, click: () => this.clickConsoleEndpoint() },
                      }}
                      small
                      outlined
                      class="ml-1"
                      disabled={this.consoleDisabled}
                    >
                      <VIcon small>mdi-console</VIcon>
                    </VBtn>
                  ),
                },
              }}
            >
              <span>open pod's terminal by copying the popup command</span>
            </VTooltip>
            <VTooltip
              top
              openDelay={1.5 * 1000}
              color="primary lighten-1"
              {...{
                scopedSlots: {
                  activator: ({ on, attrs }) => (
                    <VBtn
                      {...attrs}
                      on={on}
                      small
                      outlined
                      link
                      target="_blank"
                      href={this.fileLink}
                      class="ml-1"
                      disabled={this.fileDisabled}
                    >
                      <VIcon small>mdi-file-chart-outline</VIcon>
                    </VBtn>
                  ),
                },
              }}
            >
              <span>open the protobuf file</span>
            </VTooltip>
          </VCol>
        </VRow>

        {this.showAdancedOptions && (
          <VRow>
            <VCol cols="2">
              <VSelect
                items={[
                  config.grpc.defaultOption,
                  "custom",
                  "choose from file...",
                ]}
                label="protobuf"
                vModel={this.protobufSrcType}
                onChange={(v) => {
                  if (v === config.grpc.defaultOption) {
                    this.protobufSrc = config.grpc.defaultSource;
                  } else {
                    this.protobufSrc = "https://";
                  }
                }}
              />
            </VCol>
            <VCol cols="8">
              <VTextField
                value="https://"
                label="Repo"
                readonly={this.protobufSrcType === config.grpc.defaultOption}
                vModel={this.protobufSrc}
              />
            </VCol>

            <VCol cols="2">
              <VTextField vModel={this.branch} label="Branch" />
            </VCol>
          </VRow>
        )}

        <VRow>
          {this.showAdancedOptions && (
            <VCol cols="12">
              <VSelect label="File" items={["demo/EchoService.proto"]} />
            </VCol>
          )}
          <VCol>
            <VSelect
              label="Service(Protobuf)"
              vModel={this.protoService}
              items={this.protoServices}
            />
          </VCol>

          <VCol>
            <VSelect
              label="Method"
              vModel={this.protoMethod}
              items={this.protoMethods}
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12" class="pa-0">
            <VTextarea
              outlined
              class="pa-0"
              vModel={this.request}
              placeholder="request"
              label="Request"
              // autoGrow
              rows={13}
            />
          </VCol>
        </VRow>
        <VRow>
          <VCol cols="12">
            <VBtn
              outlined
              disabled={this.requestDisabled}
              loading={this.requestDoing}
              onClick={() => this.makeRequest()}
            >
              Request
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
              autoGrow
              hideFilterOption
              hideJsonFilter
              hideCommonOptions
              filterMode="jsEval"
              label="Response"
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
