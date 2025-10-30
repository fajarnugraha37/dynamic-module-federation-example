<script>
import svg from '@commons/ui/assets/logo.svg';
import JsonEditor from "@commons/components/atoms/JsonEditor.vue";
export default {
    name: 'App',
    components: {
        JsonEditor
    },
    mounted() {
        // this.$store.registerModule('sample', sampleVuexStore);
        for (let i = 0; i < 10; i++) {
            this.$store.commit('increment');
        }
    },
    methods: {
        increment() {
            this.$store.commit('increment');
        },
        decrement() {
            this.$store.commit('decrement');
        },
        reset() {
            this.$store.commit('reset');
        }
    },
    data() {
        return {
            svg,
            data: {
                name: "fajar",
                age: 29,
                roles: ["admin", "editor"],
                active: true,
                profile: { city: "bandung", score: 9.5 }
            }
        };
    },
};
</script>

<template>

    <body>
        <header>
            <img alt="Vue logo" class="logo" :src="svg" width="125" height="125" />

            <div class="wrapper">
                <div class="greetings">
                    <h3>
                        You've successfully created a project with {{ this.$store.state.count }} items!
                        <a href="https://vitejs.dev/" target="_blank" rel="noopener">Vite</a> +
                        <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 2</a>.
                    </h3>
                    <nav>
                        <a href="#" v-on:click="increment()">Increment</a>
                        <a href="#" v-on:click="decrement()">Decrement</a>
                        <a href="#" v-on:click="reset()">Reset</a>
                        <a href="/">Home</a>
                        <a href="/vue-2">Vue 2</a>
                        <a href="/vue-3">Vue 3</a>
                    </nav>
                </div>
            </div>
        </header>

        <div class="editor-container">
            <JsonEditor v-model="data" :editorOptions="{ theme: 'bootstrap5', iconlib: 'fontawesome5' }" />
            <pre>{{ data }}</pre>
        </div>
    </body>
</template>

<style>
header {
    max-height: 100vh;
    line-height: 1.5;
}

.logo {
    display: block;
    margin: 0 auto 2rem;
}

nav {
    width: 100%;
    margin-top: 2rem;
    font-size: 12px;
    text-align: center;
}

nav a.router-link-exact-active {
    color: var(--color-text);
}

nav a.router-link-exact-active:hover {
    background-color: transparent;
}

nav a {
    display: inline-block;
    padding: 0 1rem;
    border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
    border: 0;
}

.editor-container {
    display: flex;
    gap: 3rem;
    padding: 3rem;
    align-items: flex-start;
    background: linear-gradient(to bottom, #ffffff, #f8fafc);
    border-radius: 20px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
}

.editor-container>* {
    flex: 1;
    min-width: 0;
}

.editor-container pre {
    margin: 0;
    padding: 2rem;
    background: #ffffff;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    font-size: 0.95rem;
    white-space: pre-wrap;
    word-break: break-word;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    color: #2d3748;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
    position: relative;
    overflow: hidden;
}

.editor-container pre::before {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    padding: 0.5rem 2rem;
    background: #f7fafc;
    border-bottom: 1px solid #e2e8f0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 0.875rem;
    color: #4a5568;
    font-weight: 500;
}

body {
    display: flex;
    flex-direction: column;
    gap: 3rem;
    padding: 2rem;
    min-height: 100vh;
    background: linear-gradient(135deg, #f0f4f8 0%, #edf2f7 100%);
}

.greetings {
    padding: 2rem;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
}

.greetings h3 {
    color: #2d3748;
    font-size: 1.5rem;
    font-weight: 600;
    line-height: 1.4;
    margin-bottom: 1rem;
}

.greetings a {
    color: #4299e1;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
}

.greetings a:hover {
    color: #2b6cb0;
    text-decoration: underline;
}

header {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}

.wrapper {
    width: 100%;
}

@media (width >=1024px) {
    .logo {
        margin: 0 2rem 0 0;
    }

    nav {
        padding: 1rem 0;
        margin-top: 1rem;
        margin-left: -1rem;
        font-size: 1rem;
        text-align: left;
    }
}
</style>