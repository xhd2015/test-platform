<script>
import {
  VContainer,
  VList,
  VListItem,
  VListItemContent,
  VListItemGroup,
  VIcon,
  VImg,
  VBtn,
  VCheckbox,
  VRating,
} from "vuetify/lib/components";

import { Editable } from "./fragment";

export default {
  props: {
    items: {
      type: Array,
      description: "[{text,checked}]",
    },
  },
  data() {
    return {
      mItems: [],
    };
  },
  computed: {},
  created() {
    this.$watch(
      "items",
      (items) => {
        this.mItems = [...(items || [])];
      },
      { immediate: true }
    );
  },
  mounted() {},
  methods: {
    async createNew() {
      const item = {
        id: await this.idgen.get(),
        checked: false,
        text: "TODO",
        editable: true,
      };
      this.mItems.splice(0, 0, item);
      this.$emit("itemPush", item);
    },
    remove(i) {
      this.mItems.splice(i, 1);
      this.$emit("itemRemove", this.mItems[i]);
    },
  },
  render() {
    return (
      <VContainer>
        <VList>
          <VListItem>
            <VBtn onClick={() => this.createNew()}>Create New</VBtn>
          </VListItem>
          {this.mItems.map((item, i) => [
            <VListItem
              key={item.id}
              class="d-flex"
              style={{ justifyContent2: "space-between" }}
            >
              {
                // VCheckbox is so special!!
                // value & onInput should be replaced by
                // inputValue & onChange
              }
              <VCheckbox
                inputValue={item.checked}
                onChange={(e) => {
                  item.checked = e;
                  this.$emit("itemChange", item);
                }}
              />
              <Editable
                editable={item.editable}
                vModel={item.text}
                onInput={() => {
                  this.$emit("itemChange", item);
                }}
              >
                <span class="d-2"></span>
              </Editable>

              <VIcon
                style={{ alignSelf2: "flex-end" }}
                onClick={() => this.remove(i)}
              >
                mdi-delete
              </VIcon>
            </VListItem>,
            <VListItem    key={`${item.id}-rating`}>
              <VRating
                style={{ display: "block" }}
                vModel={item.stars}
                onInput={() => {
                  this.$emit("itemChange", item);
                }}
                empty-icon="mdi-star-outline"
                full-icon="mdi-star"
                half-icon="mdi-star-half-full"
                hover
                length="10"
                size="20"
                dense
                value="3"
              />
            </VListItem>,
          ])}
        </VList>
      </VContainer>
    );
  },
};
</script>
