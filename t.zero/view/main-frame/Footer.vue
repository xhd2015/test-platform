<script>
import {
  VContainer,
  VRow,
  VCol,
  VBtn,
  VTextField,
  VInput,
  VList,
  VListItem,
  VListItemGroup,
  VListItemIcon,
  VListItemContent,
  VSubheader,
  VIcon,
  VImg,
  VOverlay,
  VDialog,
  VToolbar,
  VToolbarTitle,
  VToolbarItems,
  VCard,
  VSpacer,
} from "vuetify/lib/components";
import { IconSwitch, Overlap, PositionObserved } from "../fragment";
import HeadVue from "../fragment/Head.vue";
import {
  JSONPretty,
  Clipboard,
  RegexMatcher,
  StringConvert,
  SearchLog,
  TodoList,
  FunctionTransfer,
} from "../index";
import Mounted from "../Mounted";

/**
 * design of Homepage:
 *    need to convey the primary design message, and purepose
 */

export default {
  name: "Header",
  data() {
    return {};
  },
  render() {
    return (
      <div style="display: flex;flex-direction: column;align-items: center;justify-content:flex-end;flex-grow: 1">
        <footer id="footer">
          <p style="">Designed by Fulton Shaw</p>
        </footer>
      </div>
    );
  },
};



</script>