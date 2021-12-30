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
import { IconSwitch, Overlap, PositionObserved } from "./fragment";
import HeadVue from "./fragment/Head.vue";
import {
  JSONPretty,
  Clipboard,
  RegexMatcher,
  StringConvert,
  SearchLog,
  TodoList,
  FunctionTransfer,
} from "./index";
import Mounted from "./Mounted";

/**
 * design of Homepage:
 *    need to convey the primary design message, and purepose
 */

export default {
  name: "Home",
  data() {
    return {
      clipboardExpand: false,
      showOverlay: false,
      showDialog: false,
      overlayEl: undefined,
      clipboardItems: [],
      todoListItems: [],
      ecosystem: [
        {
          text: "vuetify-loader",
          href: "https://github.com/vuetifyjs/vuetify-loader",
        },
        {
          text: "github",
          href: "https://github.com/vuetifyjs/vuetify",
        },
        {
          text: "awesome-vuetify",
          href: "https://github.com/vuetifyjs/awesome-vuetify",
        },
      ],
      importantLinks: [
        {
          text: "Documentation",
          href: "https://vuetifyjs.com",
        },
        {
          text: "Chat",
          href: "https://community.vuetifyjs.com",
        },
        {
          text: "Made with Vuetify",
          href: "https://madewithvuejs.com/vuetify",
        },
        {
          text: "Twitter",
          href: "https://twitter.com/vuetifyjs",
        },
        {
          text: "Articles",
          href: "https://medium.com/vuetify",
        },
      ],
      whatsNext: [
        {
          text: "Explore components",
          href: "https://vuetifyjs.com/components/api-explorer",
        },
        {
          text: "Select a layout",
          href: "https://vuetifyjs.com/getting-started/pre-made-layouts",
        },
        {
          text: "Frequently Asked Questions",
          href: "https://vuetifyjs.com/getting-started/frequently-asked-questions",
        },
      ],
      tools: [
        {
          label: "Document",
          icon: "mdi-help",
          expand: false,
        },
        {
          label: "JSON Pretty",
          icon: "mdi-pencil",
          expand: false,
          expandComponent: () => <JSONPretty />,
        },
        {
          label: "Clipboard",
          icon: "mdi-content-copy",
          expand: false,
          expandComponent: () => (
            <Clipboard
              items={this.clipboardItems}
              onItemTextChange={(e) =>
                this.perf.setField("clipboardItems", e.id, "text", e.text)
              }
              onItemTitleChange={(e) =>
                this.perf.setField("clipboardItems", e.id, "title", e.title)
              }
              onItemRemove={(e) => this.perf.remove("clipboardItems", e.id)}
              onItemPush={(e) => {
                this.perf.setHead("clipboardItems", e.id, e);
              }}
            />
          ),
        },
        {
          label: "Regex Matcher",
          icon: "mdi-pencil",
          expand: false,
          expandComponent: () => <RegexMatcher />,
        },
        {
          label: "String Convert",
          icon: "mdi-pencil",
          expand: false,
          expandComponent: () => <StringConvert />,
        },

        {
          label: "Search Log",
          icon: "mdi-pencil",
          expand: false,
          expandComponent: () => <SearchLog />,
        },

        {
          label: "Write",
          icon: "mdi-content-copy",
          expand: false,
          expandComponent: () => (
            <iframe
              src="http://10.227.27.107:8090/happening/new?enterFrom=Happening"
              width="100%"
              height="400px"
            />
          ),
        },
        {
          label: "Happening",
          icon: "mdi-content-copy",
          expand: false,
          expandComponent: () => (
            <iframe
              src="http://10.227.27.107:8090/happening"
              width="100%"
              height="400px"
            />
          ),
        },

        // {
        //   label: "TODO List",
        //   icon: "mdi-content-copy",
        //   expand: false,
        //   expandComponent: () => (
        //     <TodoList
        //       items={this.perf.get("todoListItems")}
        //       onChange={(e) => {
        //         this.perf.set("todoListItems", e);
        //       }}
        //     />
        //   ),
        // },

        {
          label: "Function Transfer",
          icon: "mdi-content-copy",
          expand: false,
          expandComponent: () => <FunctionTransfer />,
        },
      ],
      favorites: [
        {
          link: "https://mp.csdn.net/mp_blog/manage/article",
          text: "blogs",
        },
        {
          link: "https://pictogrammers.github.io/@mdi/font/5.4.55/",
          text: "mdi icons",
        },
        {
          link: "http://10.227.27.107:8090/happening/new",
          text: "What's happening?",
        },
        {
          link: "https://pkg.go.dev/golang.org/x/tools/go/ssa",
          text: "golang: ssa",
        },
        {
          link: "https://github.com/",
          text: "github",
        },
        {
          link: "http://cloud-boe.bytedance.net/rds/worksheet/create/boe/webcast_dev_api/alter",
          text: "Alter Table(BOE)",
        },
        {
          link: "https://cloud.bytedance.net/rds/worksheet/create/cn/webcast_dev_api/alter",
          text: "Alter Table(CN)",
        },
      ],
    };
  },
  created() {
    this.perf.list("clipboardItems").then((items) => {
      this.clipboardItems.splice(0, this.clipboardItems.length, ...items);
    });

    this.perf.list("todoListItems").then((items) => {
      this.todoListItems.splice(0, this.todoListItems.length, ...items);
    });
  },
  // <input value="hello" />
  render() {
    return (
      <VContainer>
        <PositionObserved
          scopedSlots={{ e: () => <div>a</div> }}
          onChange={(e) => console.log("overlap change:", e)}
        >
          <VTextField label="overlap" value="hello" />
        </PositionObserved>
        {
          // the head banner
        }
        <VContainer>
          <h2>To the Abyss</h2>
        </VContainer>
        {
          // search box
        }
        <VRow class="text-center">
          <VCol cols="12" style2={{ display: "flex" }}>
            <VTextField
              placeholder="search..."
              appendOuterIcon="mdi-magnify"
              value=""
              style2={{ flexGrow: 1 }}
              onChange={(e) => console.log("search change:", e)} // onChange only triggered when the input finished
              onInput={(e) => console.log("search input:", e)}
            />
          </VCol>
        </VRow>
        <VRow class="text-center">
          {
            // <VCol cols="12">
            //   <VImg
            //     src={require("../assets/logo.svg")}
            //     class="my-3"
            //     contain
            //     height="200"
            //   />
            // </VCol>
          }

          <VCol cols="12" sm="9" md="6">
            <VSubheader class="display-1">Recent</VSubheader>
            <VList>
              <VListItemGroup>
                {
                  // tools group
                }
                {this.tools.map((e, idx) => [
                  <VListItem key={e.label}>
                    <VListItemIcon>
                      <VIcon>{e.icon}</VIcon>
                    </VListItemIcon>
                    <VListItemContent>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span>{e.label}</span>
                        <IconSwitch
                          v-model={e.expand}
                          unsetIcon="mdi-arrow-right-drop-circle-outline"
                          setIcon="mdi-arrow-down-drop-circle-outline"
                        />
                      </div>
                    </VListItemContent>
                  </VListItem>,
                  <span
                    key={e.label + "_component"}
                    v-show={e.expand}
                    ref={`haha_${idx}`}
                  >
                    <div
                      onClick={() => {
                        this.overlayEl = this.$refs[`haha_${idx}`];
                        // this.overlayEl.parentElement.removeChild(
                        //   this.overlayEl
                        // );
                        // this.showOverlay = true;
                        this.showDialog = true;
                        console.log("test clicked");
                      }}
                    >
                      test
                    </div>
                    {e.expandComponent?.()}
                  </span>,
                ])}
              </VListItemGroup>
            </VList>
          </VCol>

          <VCol cols="12" sm="3" md="3">
            <VRow>
              <VSubheader class="display-1">Favorite</VSubheader>
              <VContainer>
                <VList style={{ textAlign: "left" }}>
                  <VListItemGroup>
                    {
                      // <VListItem href="https://pictogrammers.github.io/@mdi/font/5.4.55/" target="_blank">
                      //   <VListItemIcon>
                      //     <VIcon>mdi-help</VIcon>
                      //   </VListItemIcon>
                      //   <VListItemContent>mdi icons</VListItemContent>
                      // </VListItem>
                    }
                    {this.favorites.map((fav) => (
                      <VListItem>
                        <VListItemContent>
                          <a
                            href={fav.link}
                            target="_blank"
                            style={{ textAlign: "left" }}
                          >
                            {fav.text}
                          </a>
                        </VListItemContent>
                      </VListItem>
                    ))}
                  </VListItemGroup>
                  {
                    // <VListItemGroup>
                    //   {
                    //     // tools group
                    //   }
                    //   {this.tools.map((e) => [
                    //     <VListItem key={e.label}>
                    //       <VListItemIcon>
                    //         <VIcon>{e.icon}</VIcon>
                    //       </VListItemIcon>
                    //       <VListItemContent>
                    //         <div
                    //           style={{
                    //             display: "flex",
                    //             justifyContent: "space-between",
                    //           }}
                    //         >
                    //           <span>{e.label}</span>
                    //           <IconSwitch
                    //             v-model={e.expand}
                    //             unsetIcon="mdi-arrow-right-drop-circle-outline"
                    //             setIcon="mdi-arrow-down-drop-circle-outline"
                    //           />
                    //         </div>
                    //       </VListItemContent>
                    //     </VListItem>,
                    //     <span key={e.label + "_component"} v-show={e.expand}>
                    //       {e.expandComponent?.()}
                    //     </span>,
                    //   ])}
                    // </VListItemGroup>
                  }
                </VList>
              </VContainer>
            </VRow>
          </VCol>

          <VCol cols="12" sm="3" md="3">
            <VRow>
              <VSubheader class="display-1">TODO List</VSubheader>
              <TodoList
                items={this.todoListItems}
                onItemChange={(e) => this.perf.set("todoListItems", e.id, e)}
                onItemRemove={(e) => this.perf.remove("todoListItems", e.id)}
                onItemPush={(e) => this.perf.setHead("todoListItems", e.id, e)}
              />
            </VRow>
          </VCol>

          <VCol cols="6">
            <h1 class="display-1 font-weight-bold mb-3">Favorite</h1>

            <v-list></v-list>
            <ul>
              <li>
                <a href>Record what you think</a>
              </li>
              <li>
                <a href>Use A JSON Tool</a>
              </li>
              <li>
                <a href>Test regex</a>
              </li>
            </ul>

            <p class="subheading font-weight-regular">
              For help and collaboration with other Vuetify developers,
              <br />
              please join our online
              <a href="https://community.vuetifyjs.com" target="_blank">
                Discord Community
              </a>
            </p>
          </VCol>

          <VCol cols="6">
            <h1 class="display-1 font-weight-bold mb-3">Index</h1>

            <v-list></v-list>
            <ul>
              <li>
                <a href>Record what you think</a>
              </li>
              <li>
                <a href>Use A JSON Tool</a>
              </li>
              <li>
                <a href>Test regex</a>
              </li>
            </ul>

            <p class="subheading font-weight-regular">
              For help and collaboration with other Vuetify developers,
              <br />
              please join our online
              <a href="https://community.vuetifyjs.com" target="_blank">
                Discord Community
              </a>
            </p>
          </VCol>

          <VCol cols="6"> B </VCol>

          <VCol cols="6"> C </VCol>

          <VCol cols="6"> D </VCol>

          <VCol>
            <HeadVue title="Welcome to Vuetify">
              For help and collaboration with other Vuetify developers,
              <br />
              please join our online
              <a href="https://community.vuetifyjs.com" target="_blank">
                Discord Community
              </a>
            </HeadVue>
          </VCol>

          <VCol class="mb-5" cols="12">
            <h2 class="headline font-weight-bold mb-3">What's next?</h2>

            <VRow justify="center">
              {this.whatsNext.map((next, i) => (
                <a
                  key={i}
                  href={next.href}
                  class="subheading mx-3"
                  target="_blank"
                >
                  {next.text}
                </a>
              ))}
            </VRow>
          </VCol>

          <VCol class="mb-5" cols="12">
            <h2 class="headline font-weight-bold mb-3">Important Links</h2>

            <VRow justify="center">
              {this.importantLinks.map((link, i) => (
                <a
                  key={i}
                  href={link.href}
                  class="subheading mx-3"
                  target="_blank"
                >
                  {link.text}
                </a>
              ))}
            </VRow>
          </VCol>

          <VCol class="mb-5" cols="12">
            <h2 class="headline font-weight-bold mb-3">Ecosystem</h2>

            <VRow justify="center">
              {this.ecosystem.map((eco, i) => (
                <a
                  key={i}
                  href={eco.href}
                  class="subheading mx-3"
                  target="_blank"
                >
                  {eco.text}
                </a>
              ))}
            </VRow>
          </VCol>
        </VRow>

        <VDialog fullscreen vModel={this.showDialog}>
          <VCard>
            <VToolbar dark color="primary">
              <VToolbarTitle>JSON Pretty</VToolbarTitle>
              <VSpacer></VSpacer>
              <VToolbarItems>
                <VBtn icon dark onClick={() => (this.showDialog = false)}>
                  <VIcon>mdi-close</VIcon>
                </VBtn>
              </VToolbarItems>
            </VToolbar>

            <div style={{ height: "100%", backgroundColor: "white" }}>
              <div
                style={{
                  backgroundColor: "white",
                  // height: "600px",
                  // width: "100%",
                }}
                class="ma-2"
                ref="z"
              ></div>
              <Mounted
                didMount={() => {
                  console.log("ref z:", this.$refs.z);
                  this.$refs.z.appendChild(this.overlayEl);
                }}
              ></Mounted>
            </div>
          </VCard>

          {
            // <div style={{ height: "100%", backgroundColor: "white" }}>
            //   <div
            //     style={{
            //       backgroundColor: "white",
            //       // height: "600px",
            //       // width: "100%",
            //     }}
            //     class="ma-2"
            //     ref="z"
            //   ></div>
            //   <Mounted
            //     didMount={() => {
            //       console.log("ref z:", this.$refs.z);
            //       this.$refs.z.appendChild(this.overlayEl);
            //     }}
            //   ></Mounted>
            // </div>
          }
        </VDialog>
        <VOverlay absolute={false} value={this.showOverlay} opacity={0.45}>
          <VBtn color="success" onClick={() => (this.showOverlay = false)}>
            Hide Overlay
          </VBtn>

          <div
            ref="x"
            style={{ backgroundColor: "white", height: "600px", width: "100%" }}
          ></div>
          {
            // <Mounted
            //   onMounted={() => {
            //     console.log("refx:", this.$refs.x);
            //     this.$refs.x.appendChild(this.overlayEl);
            //   }}
            // ></Mounted>
          }
        </VOverlay>
      </VContainer>
    );
  },
};
</script>
