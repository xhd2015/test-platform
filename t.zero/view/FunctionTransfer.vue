<script>
import { ResultArea, Stack } from "./fragment";
import { setWindowContentChanged } from "../util/window";
import { callFunc } from "../util/codefn";
import { chooseFileToSave, chooseFileToRead, CONTENT_JSON } from "../util/file";
import { jsDateToYYYYMMDD_HHMMSS } from "@fultonjs/common/src/date-utils";
import { loadCode, trasferLargeNumber } from "@fultonjs/common/src/code";
import lodash from "lodash";
import { VTextarea,VTextField, VBtn,VSelect } from "./vuetify";

export default {
  props: [],
  data() {
    return {
      argRefs: [],
      funcRefs: [],
      autoTransfer: true,
      funcResult: "",
      funcError: false,
      objCache: {},
      args: `{
    id:"",
}`,
      func:
        // the fourth is context
        `function(context,config) {
    
}`,
    };
  },

  methods: {
    recordChange() {
      setWindowContentChanged();
    },
    clearError() {
      this.funcError = false;
    },
    setError(e) {
      this.funcError = true;
      this.funcResult = e;
    },
    autoEvaluate() {
      if (this.autoTransfer) {
        this.evaluate();
      }
    },
    evaluate() {
      let context = this.context;
      if (context.error) {
        return;
      }
      this.clearError();
      try {
        this.funcResult = callFunc({
          func: context.func,
          args: [context, context.arg],
        });
      } catch (e) {
        this.setError(e);
        if (context.funcs.onError != null) {
          callFunc({
            func: context.funcs.onError,
            args: [context, e],
          });
        } else {
          console.log(e);
        }
      }
    },
    toggleAutoTransfer() {
      this.autoTransfer = !this.autoTransfer;
    },
    load() {
      let _this = this;
      chooseFileToRead(function (result, filename) {
        _this.funcError = false;
        try {
          let res = JSON.parse(result);
          _this.args = res["args"];
          _this.func = res["func"];
          _this.argRefs = res["argRefs"];
          _this.funcRefs = res["funcRefs"];
        } catch (e) {
          _this.funcError = true;
          _this.funcResult = e;
        }
      });
    },
    save() {
      let context = this.context;
      let id;
      if (!context.error) {
        id = context.arg.id;
      }
      let fileName = id != null && id != "" ? `${id}` : "template";
      fileName = fileName + "_" + jsDateToYYYYMMDD_HHMMSS() + ".json";
      let res = {
        args: this.args,
        func: this.func,
        argRefs: this.argRefs,
        funcRefs: this.funcRefs,
      };
      res = JSON.stringify(res);
      chooseFileToSave(res, fileName, CONTENT_JSON);
    },
    saveResult() {
      if (this.funcError) {
        return;
      }
      let context = this.context;
      let id = context.arg.id;
      let fileName =
        id != null && id != "" ? `${id}_result.json` : "result.json";
      let res = this.funcResult;
      chooseFileToSave(res, fileName, CONTENT_JSON);
    },
    saveResultAndFunction() {
      this.save();
      this.saveResult();
    },
    addRef(refType) {
      let obj = this.argRefs;
      let prefix = "key";
      let initContent = "";
      if (refType == "func") {
        obj = this.funcRefs;
        prefix = "func";
        initContent = `function(context){
    
}`;
      }
      let n = obj.length;
      let i = n;
      while (true) {
        let name = `${prefix}${i++}`;
        let found = false;
        for (let ref of obj) {
          if (ref.name == name) {
            found = true;
            break;
          }
        }
        if (!found) {
          obj.push({
            name: name,
            show: true,
            content: initContent,
          });
          return;
        }
      }
    },
    removeRef(refType, idx) {
      let refs = refType == "func" ? this.funcRefs : this.argRefs;
      refs.splice(idx, 1);
    },
    parseObject(content) {
      return this.parseContent(content, {
        isScript: true,
        useLargeNumber: true,
      });
    },
    parseFunction(content) {
      return this.parseContent(content, {
        isScript: true,
        useLargeNumber: true,
      });
    },
    // options:
    //     - isScript: if the content is a javascript script when true, or just pure json when false
    //     - useLargeNumber: when isScript==true, should big numbers be represented as BigInt
    //                       when isScript==false, this option is true when using JSON-bigint, false when using native JSON
    parseContent(content, options) {
      if (!content) return content;
      let { isScript, useLargeNumber } = options;
      isScript = !!isScript;
      useLargeNumber = !!useLargeNumber;
      let cache = this.objCache[content];
      if (
        cache != null &&
        typeof cache.obj !== "undefined" &&
        cache.isScript === isScript &&
        cache.useLargeNumber === useLargeNumber
      ) {
        return cache.obj;
      }
      let obj;
      if (isScript) {
        if (useLargeNumber) {
          try {
            content = trasferLargeNumber("(" + content + ")").trim();
            if (content.endsWith(";")) {
              content = content.slice(0, content.length - 1);
            }
          } catch (e) {
            console.log("trasferLargeNumber error ignored:", e);
          }
        }
        obj = loadCode(content);
      } else {
        obj = JSON.parse(content);
      }
      this.objCache = { obj, isScript, useLargeNumber };
      return obj;
    },
  },
  computed: {
    context() {
      this.clearError();
      // compute function firstly
      let context = {
        funcs: {},
        args: {},
        func: null,
        arg: null,
        error: false,
      };
      // func does not require context
      for (let funcRef of this.funcRefs) {
        try {
          context.funcs[funcRef.name] = this.parseFunction(funcRef.content);
        } catch (e) {
          this.setError(`loading func ${funcRef.name}:` + e);
          context.error = true;
          return context;
        }
      }
      try {
        context.func = this.parseFunction(this.func);
      } catch (e) {
        this.setError(`loading func:` + e);
        context.error = true;
        return context;
      }
      // largenumber + eval => JSON
      for (let argRef of this.argRefs) {
        // we do not support using context in the argument, because we would cache content
        try {
          context.args[argRef.name] = this.parseObject(argRef.content);
        } catch (e) {
          this.setError(`loading arg ${argRef.name}:` + e);
          context.error = true;
          return context;
        }
      }
      try {
        context.arg = this.parseObject(this.args);
      } catch (e) {
        this.setError("loading arg:" + e);
        context.error = true;
        return context;
      }
      return context;
    },
  },
  watch: {
    args() {
      this.recordChange();
      this.debouncedAutoEvaluate();
    },
    func() {
      this.recordChange();
      this.debouncedAutoEvaluate();
    },
    argRefs: {
      deep: true,
      handler() {
        this.recordChange();
        this.debouncedAutoEvaluate();
      },
    },
    funcRefs: {
      deep: true,
      handler() {
        this.recordChange();
        this.debouncedAutoEvaluate();
      },
    },
  },
  created() {
    this.debouncedAutoEvaluate = lodash.debounce(this.autoEvaluate, 200);
  },
  render() {
    return (
      <div>
        <label>Arguments:</label>
        <button onClick={() => this.load()}>Load...</button>
        <button onClick={() => this.save()}>Save...</button>
        <br />

        <VTextarea
          style="width: 100%; height: 200px"
          vModel={this.args}
          appendIcon="mdi-help"
        ></VTextarea>
        <br />
        <button onClick={() => this.addRef("arg")}>Add Argument</button>
        {this.argRefs.map((argRef, idx) => (
          <div key={idx}>
            <div>
              <input vModel={argRef.name} />
              <span onClick={() => (argRef.show = !argRef.show)}>
                <span>{argRef.show ? "▼" : "▶"}</span>
              </span>
            </div>
            <div vShow={argRef.show}>
              <button onClick={() => this.removeRef("arg", idx)}>Remove</button>{" "}
              <br />
              <textarea
                style="width: 100%; height: 200px"
                vModel={argRef.content}
              ></textarea>
            </div>
          </div>
        ))}

        <br />
        <div style={{position:"relative"}}>
        <VTextarea style="width: 100%; height: 200px" vModel={this.func} label="Function:"/>
        <VSelect style={{position:"absolute", bottom:"90%", left:"90%"}} items={["A","B","C"]} label="Use Clipboard" onInput={(e)=>this.func=e}>Top-Right-Text</VSelect>
        </div>
        <br />
        <button onClick={() => this.addRef("func")}>Add Function</button>
        {this.funcRefs.map((funcRef, idx) => (
          <div key={idx}>
            <div>
              <input vModel={funcRef.name} />
              <span onClick={() => (funcRef.show = !funcRef.show)}>
                <span>{funcRef.show ? "▼" : "▶"}</span>
              </span>
            </div>
            <div vShow={funcRef.show}>
              <button onClick={() => this.removeRef("func", idx)}>
                Remove
              </button>{" "}
              <br />
              <textarea
                style="width: 100%; height: 200px"
                vModel={funcRef.content}
              ></textarea>
            </div>
          </div>
        ))}

        <br />
        <hr />
        <button onClick={() => this.toggleAutoTransfer()}>
          {this.autoTransfer ? "Disable" : "Enable"} Auto Transfer
        </button>
        <button onClick={() => this.saveResult()}>Save Result</button>
        <button onClick={() => this.saveResultAndFunction()}>
          Save Result &amp; Function
        </button>
        <ResultArea
          text={this.funcResult}
          error={this.funcError}
          pureJson={false}
          ref="result"
        ></ResultArea>
      </div>
    );
  },
};
</script>

<style scoped>
</style>
