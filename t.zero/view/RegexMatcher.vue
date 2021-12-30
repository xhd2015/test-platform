<script>
// RegExp = regular expression

// let reg = new RegExp(...)
//   reg.test(...)   // test if the string matches the expression
//
//
// Usage:
//   exec(s) -> reg exp updates its lastIndex when 'g' is set
//   and exec(s) starts to search at lastIndex, if no 'g' specified,it will be a dead loop
//  you can check lastIndex to ensure the whole string is matched when setting 'g'.
//
//   test(s) -> returns true or false
// var myRe = /ab*/g;
// var str = 'abbcdefabh';
// var myArray;
// while ((myArray = myRe.exec(str)) !== null) {
//     var msg = 'Found ' + myArray[0] + '. ';
//     msg += 'Next match starts at ' + myRe.lastIndex;
//     console.log(msg);
// }
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

// Example:
// a=/(a)(b)*(c)/g.exec("abbbc")
//  [0]=abc  [1]=a [2]=b [3]=c
// Note that group is literal, * outside a group catch is not catched
//  a=/(a)(b*)(c)/g.exec("abbbc")
//   [0]=abc  [1]=a [2]=bbb [3]=c
//
// assertation:
//  x(?=y)   assert suffix y
//  x(?!y)   assert no suffix y
export default {
  name: "RegexMatcher",
  data() {
    return {
      regex: "",
      tests: "",
      result: "",
      matches: false,
      regexError: "",
      matchGroups: [],
      enableMatch: true,
      enableSplit: true,
      splitResult: [],
      // tests:[]
    };
  },
  methods: {
    updateMatch() {
      let regex = this.getCompiledRegex();
      if (this.regexError != null) {
        return;
      }
      if (this.enableMatch) {
        this.matches = false;
        let arr = regex.exec(this.tests);
        if (arr === null) {
          this.matchGroups = [];
        } else {
          this.matches = true;
          this.matchGroups = arr;
        }
      }
      if (this.enableSplit) {
        this.splitResult = this.tests.split(new RegExp(this.regex));
      }
    },
    getCompiledRegex() {
      try {
        this.regexError = null;
        // do not set multiline, set dotAll=s
        return new RegExp("^" + this.regex + "$", "s");
      } catch (err) {
        this.regexError = err.toString();
      }
    },
  },
  computed: {
    matchState() {
      return this.regexError == null
        ? this.matches
          ? "Match"
          : "Not Match"
        : this.regexError;
    },
    matchColor() {
      return this.regexError == null && this.matches ? "green" : "red";
    },
  },
  watch: {
    regex: function (val) {
      this.updateMatch();
    },
    tests: function (val) {
      this.updateMatch();
    },
  },
  render() {
    //   enhancement: use $...^ to encapsulate the regex, to ensure it match entirely,
    //   without ^...$:  (([A-Z])|([A-Z][A-Z]+)|([A-Z][a-z0-9]+)) -> exec("Ds") -> returns "D" match, lastIndex=1
    //   with ^...$:  ^(([A-Z])|([A-Z][A-Z]+)|([A-Z][a-z0-9]+))$ -> exec("Ds") -> returns "Ds" match

    return (
      <div>
        <VTextarea  outlined vModel={this.regex} label="Regex" />
        <VTextarea  outlined vModel={this.tests} label="Tests" />

        <div style="display: flex">
          <VCheckbox label="Show Match" vModel={this.enableMatch} />
          <VCheckbox label="Show Split" vModel={this.enableSplit} />
        </div>

        {this.regexError != null && (
          <div style="color: red">{this.regexError.toString()}</div>
        )}
        {this.enableMatch && this.regexError == null && (
          <div style="margin-top: 20px">
            <label>Match:</label>
            <div style={{ color: this.matchColor, display: "inline-block" }}>
              {this.matchState}
            </div>
            {this.matches &&
              this.matchGroups.map((group, idx) => (
                <div>
                  <span>
                    group[{idx}] = {group}
                  </span>
                </div>
              ))}
          </div>
        )}
        {this.enableSplit && this.regexError == null && (
          <div style="margin-top: 20px">
            <label>Split:</label>
            {this.splitResult.map((split, idx) => (
              <div>
                <span>
                  split[{idx}] = {split}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  },
};
</script>

<style scoped>
</style>
