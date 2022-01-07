<template>
  <v-text-field v-bind="$attrs" v-on="$listeners">
    <!--VInput does not process dynamic attrs, otherwise it would use $scopedSlots.append(attrs) instead of $slots.append-->
    <template v-slot:append v-if="appendComp">
      <!-- <button>Mi</button> -->
      <component :is="appendComp" />
      <!-- <component :is="$scopedSlots.append(attrs)" /> -->
    </template>
  </v-text-field>
</template>

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
  VSelect,
  VTextField,
  VSwitch,
  VSnackbar,
  VTooltip,
  VCombobox,
} from "vuetify/lib/components";

// the problem we solved:
//     the vuetify's source code using this.$slots instead of this.$scopedSlots when rendering 'append' slot, which does not work
export default {
  name: "TextFieldAppend",
  props: {
    appendProps: {
      // any thing will be passed verbatim
      // this is ugly, but as a workaroud works well
      description: "args passed to append",
    },
  },
  computed: {
    appendComp() {
      let _this = this;
      if (!_this.$scopedSlots.append) {
        return null;
      }
      return {
        render() {
          return _this.$scopedSlots.append(_this.appendProps);
        },
      };
    },
  },
  created() {
    // scopedSlots not available until mounted
    // console.log("scopedSlots:", this.$scopedSlots);
    // console.log("slots:", this.$slots);
  },
  mounted() {
    // console.log("scopedSlots:", this.$scopedSlots);
    // console.log("slots:", this.$slots);
  },
};
</script>
