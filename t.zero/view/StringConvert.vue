<script>
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

import {
  formatTemplate,
  capitalize,
  decodeHexString,
  quoteToCString,
  toInt8ArrayJSON,
  encodeToHexString,
} from "../util/strings";

import crypto from "crypto";
import Toggle from "./fragment/Toggle.vue";

export default {
  name: "StringConvert",
  data() {
    return {
      text: "",
      type: "", // CamelCase   snake.case snake_b_c
      convertResult: {
        "snake.case": "",
        under_line: "",
        CamelCase: "",
        "kabe-case": "",
        "colon:case": "",
      },
      emptyConvertResult: {
        "snake.case": "",
        under_line: "",
        CamelCase: "",
        "kabe-case": "",
        "colon:case": "",
      },
      encText: "",
      encKey: "",
      encTypes: [
        {
          type: "MD5",
          // "uri": "/misc/md5?s=${text}",
          convert(t) {
            return crypto.createHash("md5").update(t).digest("hex");
          },
          error: false,
          result: "",
          enable: true,
        },
        // {
        //     "type": "Hash",
        //     "uri": "/misc/hash?s=${text}&salt=${key}",
        //     "error": false,
        //     "result": "",
        //     enable: true
        // },
        {
          type: "Base64-Encode",
          // "uri": "/misc/base64/encode?s=${text}",
          convert: function (text, key) {
            // use Buffer to encode
            return Buffer.from(text).toString("base64");
          },
          error: false,
          result: "",
          enable: true,
        },
        {
          type: "Base64-Decode",
          // "uri": "/misc/base64/decode?s=${text}",
          convert: function (text, key) {
            return Buffer.from(text, "base64").toString("ascii");
          },
          error: false,
          result: "",
          enable: false,
        },
        {
          type: "AES-Encrypt",
          // "uri": "/misc/aes/encrypt?s=${text}&key=${key}",
          convert: function (text, key) {
            return "TODO";
          },
          error: false,
          result: "",
          enable: false,
        },
        {
          type: "AES-Decrypt",
          // "uri": "/misc/aes/decrypt?s=${text}&key=${key}",
          convert: function (text, key) {
            return "TODO";
          },
          error: false,
          result: "",
          enable: false,
        },

        // {
        //     "type": "AES-Encrypt/AdsSecurity",
        //     "uri": "/misc/adSecurity/enc?s=${text}&key=${key}",
        //     "error": false,
        //     "result": "",
        //     enable: false
        // },
        // {
        //     "type": "AES-Decrypt/AdsSecurity",
        //     // "uri": "/misc/adSecurity/dec?s=${text}&key=${key}",
        //      convert: function (text, key) {
        //         return  "TODO"
        //     },
        //     "error": false,
        //     "result": "",
        //     enable: false
        // },

        {
          type: "URL-Encode",
          convert: function (text, key) {
            return encodeURIComponent(text);
          },
          error: false,
          result: "",
          enable: false,
        },
        {
          type: "URL-Decode",
          convert: function (text, key) {
            return decodeURIComponent(text);
          },
          error: false,
          result: "",
          enable: false,
        },
        {
          type: "Host-to-IP",
          uri: "/misc/host2Ip?host=${text}",
          error: false,
          result: "",
          enable: false,
        },
      ],
      transferModel: {
        inputMode: "Binary Hex String",
        inputObject: "",
        outputMode: "Binary Quote String",
        outputObject: "",
      },
    };
  },
  methods: {
    updateMatch() {
      this.convertResult = this.emptyConvertResult;
      if (!this.text) {
        this.type = "empty";
        return;
      }

      if (this.text.indexOf("_") > 0) {
        this.type = "under_line";
      } else if (this.text.indexOf(".") > 0) {
        this.type = "snake.case";
      } else if (this.text.indexOf("-") > 0) {
        this.type = "kabe-case";
      } else if (this.text.indexOf(":") > 0) {
        this.type = "colon:case";
      } else {
        this.type = "CamelCase";
      }
      let arr = this.split(this.type, this.text);
      for (let type in this.emptyConvertResult) {
        this.convertResult[type] = this.join(type, arr);
      }
    },
    split(type, s) {
      if (type === "under_line") {
        return s.split("_").map((e) => (e ? e.toLowerCase() : e));
      } else if (type === "snake.case") {
        return s.split(".");
      } else if (type === "kabe-case") {
        return s.split("-");
      } else if (type === "colon:case") {
        return s.split(":");
      } else {
        return s.split(new RegExp("(?<=^|[a-z0-9](?=[A-Z])|(?=[A-Z][a-z]))"));
      }
    },
    join(type, s) {
      if (type === "under_line") {
        return s.map((e) => (e ? e.toUpperCase() : e)).join("_");
      } else if (type === "snake.case") {
        return s.map((e) => (e ? e.toLowerCase() : e)).join(".");
      } else if (type === "kabe-case") {
        return s.map((e) => (e ? e.toLowerCase() : e)).join("-");
      } else if (type === "colon:case") {
        return s.map((e) => (e ? e.toLowerCase() : e)).join(":");
      } else {
        return s.map((e) => capitalize(e)).join("");
      }
    },
    updateEncText() {
      let cfg = {
        text: encodeURIComponent(this.encText),
        key: encodeURIComponent(this.encKey),
      };
      for (let i = 0; i < this.encTypes.length; ++i) {
        this.updateSelectedEncText(i, cfg);
      }
    },
    updateSelectedEncText(i, cfg) {
      if (cfg == null) {
        cfg = {
          text: encodeURIComponent(this.encText),
          key: encodeURIComponent(this.encKey),
        };
      }
      let encType = this.encTypes[i];
      encType.error = false;
      encType.result = "";
      if (encType.enable) {
        if (encType.convert) {
          try {
            encType.result = encType.convert(this.encText, this.encKey);
          } catch (e) {
            encType.result = e.toString();
            encType.error = true;
          }
          return;
        } else {
          encType.error = true;
          encType.result = "not implemented";
        }

        // RequestUtils.request(
        //   {
        //     uri: this.formatUrl(encType.uri, cfg),
        //   },
        //   {
        //     success(resp) {
        //       encType.result = resp;
        //     },
        //     fail(code, resp) {
        //       encType.result = resp;
        //       encType.error = true;
        //     },
        //   }
        // );
      }
    },
    formatUrl(urlTemplate, config) {
      return formatTemplate(urlTemplate, config);
    },
    transfer() {
      if (
        this.transferModel.inputMode !== "Binary Hex String" &&
        this.transferModel.inputMode !== "Plain String" &&
        this.transferModel.inputMode !== "Int8Array"
      ) {
        alert(
          "Only support 'Binary Hex String','Plain String','Int8Array' input currently"
        );
        return;
      }
      // if (this.transferModel.outputMode !== 'Binary Quote String' && this.transferModel.outputMode !== 'echo -ne' && this.transferModel.outputMode !== 'Plain String') {
      //     alert("Only support 'Binary Quote String','echo -ne','Plain String' output currently")
      //     return
      // }
      this.transferModel.outputObject = null;
      if (
        this.transferModel.inputObject === null ||
        this.transferModel.inputObject === ""
      ) {
        return;
      }
      // inputObject
      // init:must be type of  String; after: ArrayBuffer
      let inputObject = this.transferModel.inputObject;
      if (this.transferModel.inputMode === "Binary Hex String") {
        inputObject = decodeHexString(inputObject);
      } else if (this.transferModel.inputMode === "Plain String") {
        inputObject = new TextEncoder().encode(inputObject).buffer;
      } else if (this.transferModel.inputMode === "Int8Array") {
        // trim empty first
        let arr = this.loadInt8ArrayFromAny(inputObject);
        if (arr == null) {
          alert(inputObject + " contains non integral string");
          return;
        }

        inputObject = new Int8Array(arr).buffer;
      }

      // outputObject: transfer inputObject(ArrayBuffer) to string
      if (this.transferModel.outputMode === "Binary Quote String") {
        this.transferModel.outputObject = quoteToCString(inputObject);
      } else if (this.transferModel.outputMode === "echo -ne") {
        this.transferModel.outputObject =
          "echo -ne '" + quoteToCString(inputObject) + "'";
      } else if (this.transferModel.outputMode === "Plain String") {
        this.transferModel.outputObject = new TextDecoder().decode(inputObject);
      } else if (this.transferModel.outputMode === "Binary Hex String") {
        this.transferModel.outputObject = encodeToHexString(inputObject);
      } else if (this.transferModel.outputMode === "Int8Array") {
        this.transferModel.outputObject = toInt8ArrayJSON(inputObject);
      } else {
        alert("Unhandled outputMode:" + this.transferModel.outputMode);
      }
    },
    load() {},
    save() {},
    loadInt8ArrayFromAny(inputObject /*string*/) {
      // acceptable:
      // - 12
      // - [12]
      //   12,14
      //   12 14
      //   0x9d
      //   0b23

      // trim empty first
      inputObject = inputObject.trim();

      if (inputObject.startsWith("[")) {
        inputObject = inputObject.slice(1);
      }
      if (inputObject.endsWith("]")) {
        inputObject = inputObject.slice(0, inputObject.length - 1);
      }
      let strArr = inputObject.split(/[ ,]+/);
      let arr = new Array(strArr.length);

      for (let i = 0; i < strArr.length; i++) {
        arr[i] = Number.parseInt(strArr[i]);
        if (!Number.isInteger(arr[i])) {
          return null;
        }
      }
      return arr;
    },
  },
  computed: {},
  watch: {
    text: function (val) {
      this.updateMatch();
    },
    encText: function () {
      this.updateEncText();
    },
    encKey: function () {
      this.updateEncText();
    },
  },
  render() {
    return (
      <div>
        <h1 class="underlined">Case Converters</h1>
        <VTextarea  outlined label="Text" vModel={this.text} rows={1}></VTextarea>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
          }}
        >
          {Object.keys(this.convertResult || {}).map((type) => (
            <div key={type}>
              <span style={{ fontWeight: "bold" }}>{type}:</span>{" "}
              <span>{this.convertResult[type]}</span>
            </div>
          ))}
        </div>

        <h1 class="underlined">Encrypt/Decrypt Converters</h1>
        <VTextarea
          outlined
          label="Text"
          vModel={this.encText}
          placeholder="text to be encoded or decoded"
          rows={1}
          autoGrow
        />
        <VTextarea outlined label="Key(Optional)" vModel={this.encKey}  rows={1}/>

        {this.encTypes.map((encType, i) => (
          <div>
            <VCheckbox
              vModel={encType.enable}
              onInput={() => {
                this.updateSelectedEncText(i);
              }}
              label={encType.type}
            />
            <span
              style={{
                color: encType.error ? "red" : "",
                "text-decoration": "underline",
              }}
            >
              {encType.result}
            </span>
          </div>
        ))}

        <h1 class="underlined">Data Transfer</h1>
        <div>
          <Toggle
            options={[
              "Binary Hex String",
              "Base64Encode",
              "Plain String",
              "Int8Array",
            ]}
            label="Input:"
            vModel={this.transferModel.inputMode}
          ></Toggle>
          <br />
          <textarea
            vModel={this.transferModel.inputObject}
            style="width: 75%;height: 200px"
          ></textarea>
        </div>
        <div>
          <VBtn onClick={(e) => this.transfer(e)}>Transfer</VBtn>
          <VBtn onClick={(e) => this.load(e)}>Load</VBtn>
          <VBtn onClick={(e) => this.save(e)}>Save</VBtn>
        </div>

        <div>
          <Toggle
            options={[
              "Binary Hex String",
              "Binary Quote String",
              "echo -ne",
              "Plain String",
              "Int8Array",
            ]}
            label="Output:"
            vModel={this.transferModel.outputMode}
          ></Toggle>
          <br />
          <textarea
            vModel={this.transferModel.outputObject}
            style="width: 75%;height: 200px"
          ></textarea>
        </div>
      </div>
    );
  },
};
</script>

<style scoped>
</style>
