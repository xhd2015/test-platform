<script>
import {
  VCard,
  VCardTitle,
  VCardSubtitle,
  VCardText,
  VCardActions,
  VBtn,
  VSpacer,
  VContainer,
  VTextarea,
  VRow,
  VCol,
  VDivider,
  VBtnGroup,
} from "vuetify/lib/components";

import { Editable } from "./fragment";

import { isEmpty } from "@fultonjs/common/src/string";
import { bindWatch, bindEmit } from "../util/vueutil";
import { readClipboard, setClipboard } from "../util/clipboard";

// events:
//   push
//   reset
//   remove
//   copy
//   change(text)
//   titleChange(title)
const ClipboardItem = {
  name: "ClipboardItem",
  props: {
    item: {
      type: Object,
      description:
        "item to be displayed:{title,text,editTitle(default:true),showCopy(default:true),showRemove(default:true),showReset(default:false)}",
    },
  },
  data() {
    return {
      mValue: "",
      mTitle: "",
      initTitle: "",
    };
  },
  created() {
    this.initTitle = this.item.title;
    // active binding
    bindWatch(this, "item.text", "mValue");
    bindWatch(this, "item.title", "mTitle");
    bindEmit(this, "mValue", "change");
    bindEmit(this, "mTitle", "titleChange");
  },
  methods: {
    push() {
      this.$emit("push", this.mValue);
    },
    reset() {
      readClipboard()
        .then((e) => (this.mValue = e))
        .then(() => {
          this.$emit("reset", this.mValue);
        });
    },
    remove() {
      this.$emit("remove", this.mValue);
    },
    copy() {
      if (!isEmpty(this.mValue)) {
        setClipboard(this.mValue).then(() => {
          this.$emit("copy", this.mValue);
        });
      }
    },
  },
  render() {
    return (
      <VContainer>
        {
          // title
          // there are common patterns that we want
          // to clarify, this is one of them:
          // use contenteditable with jsx
        }
        <VRow>
          <VCol>
            <Editable
              editable={this.item.editTitle !== false}
              value={this.mTitle}
              validate={(e) => {
                if (e === "error") {
                  return "should not be error";
                }
              }}
              onInput={(e) => (this.mTitle = e)}
            >
              <h4 style={{ textAlign: "left" }}></h4>
            </Editable>
          </VCol>
          <VSpacer></VSpacer>
        </VRow>
        {
          // content and actions
        }
        <VRow>
          <VCol cols="10">
            <VTextarea vModel={this.mValue}></VTextarea>
          </VCol>
          <VCol
            cols="2"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-around",
            }}
          >
            {this.item.showPush !== false && (
              <VBtn onClick={() => this.push()}>Push</VBtn>
            )}
            {this.item.showCopy !== false && (
              <VBtn onClick={() => this.copy()}>Copy</VBtn>
            )}
            {this.item.showRemove !== false && (
              <VBtn onClick={() => this.remove()}>Remove</VBtn>
            )}
            {this.item.showReset && (
              <VBtn onClick={() => this.reset()}>Reset</VBtn>
            )}
          </VCol>
        </VRow>
      </VContainer>
    );
  },
};

export default {
  name: "Clipboard",
  props: {
    items: {
      type: Array, // should be Object
      initText: "",
    },
  },
  data() {
    return {
      mItems: [],
      mInitText: "",
    };
  },
  created() {
    this.mItems = [...(this.items || [])];
    this.$watch(
      "items",
      (items) => {
        this.mItems = [...(items || [])];
      },
      {
        immediate: true,
      }
    );

    this.resetInitText();
    window.ddd_clipboard = this;
  },
  methods: {
    resetInitText() {
      readClipboard().then((text) => {
        this.mInitText = text;
      });
    },
  },
  render() {
    return (
      <VContainer>
        <ClipboardItem
          item={{
            title: "Preview",
            text: this.mInitText,
            showRemove: false,
            showReset: true,
            editTitle: false,
          }}
          onPush={async (val) => {
            if (!isEmpty(val)) {
              const item = {
                id: await this.idgen.get(),
                title: "Text",
                text: val,
                showPush: false,
              };
              this.mItems.splice(0, 0, item);
              this.$emit("itemPush", item);
              // this.mItems.push({ text: val });
              this.resetInitText();
            }
          }}
        />
        {this.mItems.map((item, i) => {
          const id = item.id;
          return (
            <ClipboardItem
              key={id}
              item={item}
              onChange={(e) => {
                item.text = e;
                this.$emit("itemTextChange", item);
              }}
              onTitleChange={(e) => {
                item.title = e;
                this.$emit("itemTitleChange", item);
              }}
              onRemove={() => {
                const removed = this.mItems[i];
                this.mItems.splice(i, 1);
                this.$emit("itemRemove", removed);
              }}
              onPush={() => {
                setClipboard(item.text);
                if (i === 0) {
                  return;
                }
                const pushItem = this.mItems.splice(i, 1)[0];
                this.mItems.splice(0, 0, pushItem);
                this.$emit("itemPush", pushItem);
              }}
            />
          );
        })}
      </VContainer>
    );
  },
};
</script>
