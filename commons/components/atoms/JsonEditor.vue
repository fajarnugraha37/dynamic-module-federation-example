<!-- JsonEditor.vue -->
<template>
  <div class="je-wrapper">
    <div ref="holder"></div>
  </div>
</template>

<script>
import "bootstrap/dist/js/bootstrap.bundle.js";
import "bootstrap/dist/css/bootstrap.min.css";
import * as editor from "@json-editor/json-editor";
import { inferSchema } from "../utils/index"; // from step 1
const JSONEditor = editor.default || editor.JSONEditor || editor; // handle CJS/ESM differences

export default {
  name: "JsonEditor",
  props: {
    value: { type: [Object, Array, String, Number, Boolean, null], required: true },
    editorOptions: { type: Object, default: () => ({}) } // pass theme, iconlib, etc.
  },
  data() {
    return { 
      editor: null, 
      mounting: false,
      internalValue: null 
    };
  },
  mounted() {
    this.mountEditor();
  },
  beforeDestroy() {
    if (this.editor) this.editor.destroy();
  },
  methods: {
    mountEditor(opts) {
      if (this.editor) this.editor.destroy();
      this.mounting = true;

      const schema = inferSchema(this.value);
    //   this.editor = new JSONEditor(this.$refs.holder, {
    //     schema,
    //     startval: this.value,
    //     // sensible defaults so you can edit freely even without a “perfect” schema
    //     no_additional_properties: false,
    //     disable_properties: false,
    //     disable_edit_json: false,
    //     show_errors: "change",
    //     ...this.editorOptions,
    //     ...opts,
    //   });
      this.editor = new JSONEditor(this.$refs.holder, {
        schema,
        startval: this.value,
        theme: 'bootstrap4',
        iconlib: 'fontawesome5',
        // Enhanced configuration for better UI
        object_layout: 'grid',
        show_errors: 'interaction',
        disable_collapse: false,
        disable_edit_json: false,
        disable_properties: false,
        array_controls_top: true,
        compact: false,
        remove_empty_properties: true,
        show_opt_in: true,
        prompt_before_delete: false,
        // Better form controls
        input_width: '100%',
        input_height: '36px',
        // Object and array display
        disable_array_add: false,
        disable_array_delete: false,
        disable_array_delete_all_rows: true,
        disable_array_delete_last_row: true,
        enable_array_copy: true,
        array_controls_top: true,
        // Enable array item reordering
        disable_array_reorder: false,
        // Better validation display
        show_errors: 'interaction',
        // Enhanced code editor
        ace: {
          theme: 'ace/theme/tomorrow_night',
          tabSize: 2,
          useSoftTabs: true,
          wrap: true,
          fontSize: '14px',
          showPrintMargin: false,
          showGutter: true,
          highlightActiveLine: true
        },
        // Template options
        template: 'default',
        ...this.editorOptions,
        ...opts,
      });      this.editor.on("change", () => {
        if (this.mounting) return; // skip the initial flood
        const next = this.editor.getValue();
        // Only emit if value actually changed
        if (JSON.stringify(this.internalValue) !== JSON.stringify(next)) {
          this.internalValue = next;
          this.$emit("input", next);
          this.$emit("change", next);
        }
      });

      // initial change events done
      this.mounting = false;
    }
  },
  watch: {
    // external value changed -> reflect in editor (avoid loop)
    value: {
      deep: true,
      handler(v) {
        if (!this.editor) return;
        if (JSON.stringify(this.internalValue) !== JSON.stringify(v)) {
          this.internalValue = v;
          this.editor.setValue(v);
        }
      }
    },
    // options changed -> remount with new options
    editorOptions: {
      deep: true,
      handler(o) {
        this.mountEditor(o);
      }
    }
  }
};
</script>

<style scoped>
.je-wrapper {
  min-height: 200px;
  padding: 2rem;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Typography */
:deep(*) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Form elements and layout */
:deep(.form-control) {
  border: 2px solid #edf2f7;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s;
  background: #f8fafc;
  color: #1a202c;
  width: 100%;
}

:deep(.form-control:focus) {
  border-color: #63b3ed;
  box-shadow: 0 0 0 3px rgba(99, 179, 237, 0.2);
  outline: none;
  background: #fff;
}
</style>
