<script>
import { ResultArea } from "../fragment";
// import { decodeArrayToString } from "../util/strings";
// import { loadExcel, toExcel } from "../util/excel";
// import { stringify } from "../util/json";
// import { chooseFileToSave, chooseFileToRead, CONTENT_JSON } from "../util/file";
// import { setWindowContentChanged } from "../util/window";
// import * as logParseUtils from "@fultonjs/common/src/log-parse";
// import { debounce } from "@fultonjs/common/src/lodash-utils";
import lodash from "lodash";
// import * as config from "../config/stub";
import { api, message, copy } from "../../support";

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
  VDivider,
} from "vuetify/lib/components";

import { stringifyJSONSafeBigint } from "@fultonjs/common/src/json";

export default {
  name: "DataComposer",
  props: {},
  data() {
    return {
      tags: {}, // available tags
      tag: {}, // tags choosen
      method: "All",
      methods: [],
      composer: "",
      composers: [],
      composerDetail: null,
      partyChosen: {}, // {'user': '${groupName}:${partyInstName}' }
      composerParties: {}, // {'user':{'<groupName>':{  'u1':data1, 'u2':data2  }}}
      outputResp: {},
      output: {},
      tagsLoading: false,
      methodsLoading: false,
      composersLoading: false,
      composerDetailLoading: false,
      composerPartiesLoading: false,
      composeDoing: false,

      // -- deprecated
      myParties: [],
      myComposer: "",
    };
  },

  methods: {
    clickRefresh() {
      this.updateOutput();
    },
    async updateTags() {
      this.tagsLoading = true;
      this.tags = await api
        .listComposerTags()
        .finally(() => (this.tagsLoading = false));
      Object.keys(this.tags || {}).forEach((tag) => {
        if (!this.tag[tag]) {
          this.tag[tag] = "All";
        }
      });
      // if (!this.methods?.includes(this.method)) {
      //   this.method = "";
      // }
    },
    async updateMethods() {
      this.methodsLoading = true;
      this.methods = await api
        .listComposerMethods()
        .finally(() => (this.methodsLoading = false));
      // if (!this.methods?.includes(this.method)) {
      //   this.method = "";
      // }
    },
    async updateComposers() {
      this.composersLoading = true;
      this.composers = await api
        .listComposers({ method: this.method === "All" ? "" : this.method })
        .finally(() => (this.composersLoading = false));
      this.composer = this.composers?.[0];
    },
    async updateComposerDetail() {
      if (!this.composer) {
        return;
      }
      this.composerDetailLoading = true;
      this.composerDetail = await api
        .getComposer({ name: this.composer })
        .finally(() => (this.composerDetailLoading = false));
    },
    async updateComposerParties() {
      if (!this.composer) {
        return;
      }
      const normalizedTag = {};
      Object.keys(this.tag).forEach((tag) => {
        let val = this.tag[tag];
        if (val === "All") {
          val = "";
        }
        normalizedTag[tag] = val;
      });
      const firstKey = (o) => Object.keys(o)?.[0];
      const firstValue = (o) => o?.[firstKey(o)];
      this.composerPartiesLoading = true;
      this.composerParties = await api
        .getComposerParties({ name: this.composer, tags: normalizedTag })
        .finally(() => (this.composerPartiesLoading = false));
      // delete not existed party
      Object.keys(this.partyChosen || {}).forEach((k) => {
        if (!this.parties?.includes(k)) {
          delete this.partyChosen[k];
        }
      });
      this.parties?.forEach((party) => {
        if (
          !this.partyChosen[party] ||
          // not exists
          !this.composerPartiesFlattenItemsMapping[
            this.partyChosen[party]?.value
          ]
        ) {
          // const firstParty =
          this.partyChosen[party] = firstValue(
            this.composerPartiesFlattenItems[party]
          );
        }
      });
      this.updateOutput();
    },
    async updateOutput() {
      if (!this.composer) {
        return;
      }
      const parties = {};
      const groupMapping = {};
      Object.keys(this.partyChosen || {}).forEach((party) => {
        const { groupName, partyInstName } = this.partyChosen[party] || {};
        parties[party] = partyInstName;
        groupMapping[party] = groupName;
      });
      this.composeDoing = true;
      const resp = await api
        .doCompose({ composer: this.composer, parties, groupMapping })
        .finally(() => (this.composeDoing = false));
      this.output = resp?.data;
      this.outputResp = resp;
    },
  },
  computed: {
    parties() {
      return this.composerDetail?.parties;
    },
    loading() {
      return (
        this.tagsLoading ||
        this.methodsLoading ||
        this.composersLoading ||
        this.composerDetailLoading ||
        this.composerPartiesLoading ||
        this.composeDoing
      );
    },
    // [{text:"${partyInstName}", value:"${groupName}:${partyInstName}", groupName,partInstName}]
    composerPartiesFlattenItems() {
      const items = {};
      Object.keys(this.composerParties || {}).forEach((partyName) => {
        items[partyName] = [];
        Object.keys(this.composerParties[partyName] || {}).forEach(
          (groupName) => {
            const group = this.composerParties[partyName][groupName];
            Object.keys(group || {}).forEach((partyInstName) => {
              items[partyName].push({
                text: partyInstName,
                value: `${groupName}:${partyInstName}`,
                groupName,
                partyInstName,
              });
            });
          }
        );
      });
      return items;
    },
    // {"${groupName}:${partyInstName}": {groupName,partInstName}}
    composerPartiesFlattenItemsMapping() {
      const mapping = {};
      Object.keys(this.composerPartiesFlattenItems).forEach((party) => {
        mapping[party] = {};
        this.composerPartiesFlattenItems[party].forEach((item) => {
          mapping[party][item.value] = item;
        });
      });
      return mapping;
    },
  },
  watch: {
    method() {
      this.debounceUpdateComposers();
    },
    composer() {
      this.debounceUpdateComposerDetail();
      this.debounceUpdateComposerParties();
    },
  },
  created() {
    this.debounceUpdateTags = lodash.debounce(this.updateTags, 200);
    this.debounceUpdateMethods = lodash.debounce(this.updateMethods, 200);
    this.debounceUpdateComposers = lodash.debounce(this.updateComposers, 200);
    this.debounceUpdateComposerDetail = lodash.debounce(
      this.updateComposerDetail,
      200
    );
    this.debounceUpdateComposerParties = lodash.debounce(
      this.updateComposerParties,
      200
    );
    this.debounceUpdateOutput = lodash.debounce(this.updateOutput, 200);

    this.debounceUpdateTags();
    this.debounceUpdateMethods();
    this.debounceUpdateComposers();
    this.debounceUpdateComposerDetail();
  },
  mounted() {},
  render() {
    // 1. many configurations can be implied by service name,so hide them
    // 2. in the future, add request randomization
    return (
      <VContainer>
        <VRow>
          <VCol cols="6">
            <VSelect
              label="Method"
              vModel={this.method}
              items={["All", ...this.methods]}
            />
          </VCol>
        </VRow>

        <VRow>
          <VCol cols="3">
            <VSelect
              label="Composer"
              vModel={this.composer}
              items={this.composers}
            />
          </VCol>
        </VRow>
        <VRow>
          {Object.keys(this.tags || {}).map((tag) => (
            <VCol cols="3" key={tag}>
              <VSelect
                label={tag}
                value={this.tag[tag]}
                onChange={(v) => {
                  this.tag[tag] = v;
                  this.updateComposerParties().then(() => {
                    this.debounceUpdateOutput();
                  });
                }}
                items={["All", ...this.tags[tag]]}
              />
            </VCol>
          ))}
        </VRow>

        <VRow>
          {this.parties?.map((party) => (
            <VCol cols="3" key={party}>
              <VCombobox
                label={party}
                value={this.partyChosen[party]}
                onChange={(v) => {
                  console.log("party choosen change:", party, v);
                  this.partyChosen[party] = v;
                  this.debounceUpdateOutput();
                }}
                items={this.composerPartiesFlattenItems[party]}
              />
            </VCol>
          ))}
        </VRow>
        <VRow>
          <VCol cols="12" class="refresh">
            <VBtn
              outlined
              small
              loading={this.loading}
              disabled={this.loading}
              onClick={() => this.clickRefresh()}
            >
              Refresh
            </VBtn>
          </VCol>
        </VRow>

        <VRow>
          <VCol cols="12" class="status">
            <span>
              status:
              <span
                style={{
                  color:
                    this.outputResp?.status === "complete" ? "green" : "red",
                }}
              >
                {this.outputResp?.status || ""}
              </span>
              {this.outputResp?.lacks?.length > 0 && [
                <br />,
                <span style={{ color: "red" }}>
                  {"missing " + this.outputResp?.lacks?.join(",")}
                </span>,
              ]}
            </span>
          </VCol>
          <VCol cols="12">
            <ResultArea
              text={stringifyJSONSafeBigint(this.output)}
              pureJson={true}
              ref="result"
              inputMayNotBeJsExpr={true}
              hideFilterOption
              filterMode="jsEval"
              hideFilterOption
              hideJsonFilter
              hideCommonOptions
              rows={15}
              // autoGrow
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
  padding-top: 0;
  padding-bottom: 0;
}
.col .divider {
  margin-bottom: 10px;
}

.row2 {
  align-items: baseline;
}
.refresh {
  text-align: left;
}
.status {
  margin-bottom: 10px;
  text-align: left;
}
</style>
