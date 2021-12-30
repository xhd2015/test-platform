<script>
import {VSpacer} from "vuetify/lib/components"

export default {
  render() {
    return (
      <div class="d-flex flex-column justify-center" style={{height:"80%"}}>
        <div class="grey lighten-4 text-h3">
          Oops, <strong><span class="black--text text-h2 text-italic">{this.$route.path}</span></strong> not
          found!
        </div>
      </div>
    );
  }
};
</script>
