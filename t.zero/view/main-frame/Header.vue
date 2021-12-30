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
      <div style="width: 100%;height: 100px;background: steelblue;">
        <div>
          <ul style="list-style: none;text-align:left">
            <li style="background-color: mediumaquamarine;display: inline-block">
              <a href="documentation/index.html">Documentation</a>
            </li>
          </ul>
        </div>
        <div style="text-align: center;font-weight: bolder;">Test Platform</div>
        <div style="text-align: center;font-size: smaller;">Life Saver</div>
      </div>
    );
  },
};


</script>