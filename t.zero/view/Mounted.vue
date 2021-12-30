<script>
export default {
  props: {
    didMount: {
      type: Function,
    },
  },
  mounted() {
    console.log("mysel is mounted");
    this.didMount?.();
  },

  render() {
    return <div style={{ display: "none" }}></div>;
  },
};
</script>
