<script>
import {
  VContainer,
  VRow,
  VCol,
  VTextarea,
  VBtn,
  VIcon,
  VImg,
  VTextField,
} from "vuetify/lib/components";

export default {
  name: "SearchLog",
  data() {
    return {
      query: "",
      psm: "webcast.dev.api",
      hrefBOE: "",
      hrefOnline: "",
    };
  },
  methods: {
    updateHref() {
      // ~~a, Math.floor(x,y) will do the same thing,though
      const nowSec = parseInt(new Date().getTime() / 1000); // to int
      const start = nowSec - 15 * 60; // 15 min before
      const end = nowSec + 15 * 60; // 15 min after

      const queryParam = encodeURIComponent(this.query);

      this.hrefBOE = `https://cloud-boe.bytedance.net/ms/log/search?dcs=boe&patterns=${queryParam}&psm=${this.psm}&region=boe&tab=keywordSearch&time=${start}%2C${end}`;

      this.hrefOnline = `https://cloud.bytedance.net/ms/log/search?dcs=lf%2Chl%2Clq&patterns=${queryParam}&psm=${this.psm}&region=cn&tab=keywordSearch&time=${start}%2C${end}`;
    },
  },
  computed: {},
  created() {
    this.updateHref();
  },
  watch: {
    query() {
      this.updateHref();
    },
    psm() {
      this.updateHref();
    },
  },
  render() {
    return (
      <VContainer>
        <VTextField label="keyword" vModel={this.query} />
        <VTextField label="psm" vModel={this.psm} />
        <a href={this.hrefBOE} target="_blank">
          BOE
        </a>
        &nbsp; &nbsp; &nbsp;
        <a href={this.hrefOnline} target="_blank">
          Online
        </a>
      </VContainer>
    );
  },
};
</script>

<style scoped>
</style>
