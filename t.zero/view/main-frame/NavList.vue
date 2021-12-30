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
  name: "NavList",
  data() {
    return {};
  },
  render() {
    return (
      <ul>
        {
          // <!--
          //     <li><a href="dubbo-tools.html">Dubbo Tools</a></li>
          //     -->
          // <!--
          //     <li><a href="db-export.html">Database Tools</a></li>
          //     -->
          // <!--
          //     <li><a href="redis-tools.html">Redis Tools</a></li>
          //     -->
        }
        <li>
          <a href="regex-matcher.html">Regex Matcher</a>
        </li>
        <li>
          <a href="string-convert.html">String Converters</a>
        </li>
        <li>
          <a href="url-utilities.html">URL Tools</a>
        </li>
        <li>
          <a href="json-pretty.html">JSON Tools</a>
        </li>
        {
          // <!--
          //     <li><a href="time-tools.html">Time Tools</a></li>
          //     -->
          // <!--
          //     <li><a href="ad-tools.html">Ad Tools</a></li>
          //     -->
          // <!--
          //     <li><a href="thrift-tools.html">Thrift Tools</a></li>
          //     -->
          // <!--<li><a href="pipeline-enhancer.html">CICD/Pipeline Tools</a></li> -->
        }
        <li>
          <a href="function-transfer.html">Function Transfer</a>
        </li>
        <li>
          <a href="rpc.html">RPC</a>
        </li>
        <li>
          <a href="general-request-maker.html">General Request Maker</a>
        </li>
        <li>
          <a href="general-request-maker-index.html">
            General Request Maker - Index
          </a>
        </li>
        {
          // <div style="display: flex;flex-wrap: wrap;margin-right: 20px">
          //     <div style="display: inline" class="config-list-item">
          //         <a href="general-request-maker.html">Create a new Playground...</a>
          //     </div>
          //     <div style="display: inline" v-for="config in configs" class="config-list-item">
          //         <a :href="'general-request-maker.html?initKey=' + config">{{config}}</a>
          //     </div>
          // </div>
        }
      </ul>
    );
  },
};

</script>