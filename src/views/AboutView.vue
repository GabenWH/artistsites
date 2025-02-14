<template>
    <!-- Navigation -->
    <aside :class="['side-menu', { collapsed: isCollapsed }]">
            <!-- Toggle Button -->
            <button class="toggle-button" @click="isCollapsed = !isCollapsed">
                {{ isCollapsed ? '☰' : '✖' }}
            </button>

            <div v-if="!isCollapsed">

                <h1> {{ siteTitle }}</h1>
                <!-- About Page Link -->
                <router-link to="/shop" class="sort-button about-button" active-class="active">
                    Shop
                </router-link>
                <router-link to="/" class="sort-button about-button" active-class="active">
                    Main
                </router-link>

                <!-- Minimalist divider -->
                <hr class="divider" />
            </div>
        </aside>

    <!-- Main Content -->
    <div class="about-page">
        <p>
            {{ siteSubtitle }}
        </p>
    </div>
</template>
<script>
export default{
    props: ["siteTitle", "siteSubtitle"], // Receives props from App.vue
    data() {
        return {
        };
    },
}
</script>
<style scoped>

/* Collapsed State */
.side-menu.collapsed {
    width: 60px;
    padding: 10px;
    text-align: center;
}

/* Hide buttons and text when collapsed */
.side-menu.collapsed h1,
.side-menu.collapsed h2,
.side-menu.collapsed .sort-buttons,
.side-menu.collapsed .about-button,
.side-menu.collapsed .divider {
    display: none;
}

/* Toggle Button */
.toggle-button {
    background: none;
    border: none;
    color: rgb(0, 0, 0);
    font-size: 24px;
    cursor: pointer;
    margin-bottom: 10px;
    align-content: left;
}
</style>