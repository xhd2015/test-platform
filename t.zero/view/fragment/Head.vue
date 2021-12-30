<script>
import { VContainer } from "vuetify/lib/components";

export default {
  props: {
    title: {},
    subContent: {},
  },
  data() {
    return {};
  },
  computed: {},
  created() {},
  mounted() {},
  methods: {},
  render() {
    return (
      <VContainer class="mb-4">
        <h1 class="display-2 font-weight-bold mb-3">{this.title}</h1>
        <p class="subheading font-weight-regular">
          {this.$slots.default || this.subContent}
          {
            //   For help and collaboration with other Vuetify developers,
            //   <br />
            //   please join our online
            //   <a href="https://community.vuetifyjs.com" target="_blank">
            //     Discord Community
            //   </a>
          }
        </p>
      </VContainer>
    );
  },
};
</script>
