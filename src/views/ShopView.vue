<template>
    <div class="layout">
        <!-- Left-side menu -->
        <aside :class="['side-menu', { collapsed: isCollapsed }]">
            <!-- Toggle Button -->
            <button class="toggle-button" @click="isCollapsed = !isCollapsed">
                {{ isCollapsed ? '☰' : '✖' }}
            </button>

            <div v-if="!isCollapsed">
                <!-- Editable Title -->
                <h1> {{ siteTitle }}</h1>
                <!-- Editable Subtitle -->

                <!-- About Page Link -->
                <router-link to="/about" class="sort-button about-button" active-class="active">
                    About
                </router-link>
                <router-link to="/" class="sort-button about-button" active-class="active">
                    Main
                </router-link>

                <!-- Minimalist divider -->
                <hr class="divider" />

                <!-- Sort Buttons -->
                <div class="sort-buttons">
                    <button @click="resetFilter" :class="{ active: selectedTag === null }">All</button>
                    <button v-for="tag in availableTags" :key="tag" @click="sortByTag(tag)"
                        :class="{ active: selectedTag === tag }">
                        {{ tag }}
                    </button>
                </div>
            </div>
        </aside>

        <!-- Main content area -->
        <
        <main class="content">
            <div v-for="entry in sortedArtList" :key="entry.imageName" class="art-entry">
                <!-- 🔹 If there's a YouTube link, embed the video -->
                <template v-if="entry.youtubeLink">
                    <iframe class="media-content" 
                        :src="entry.youtubeLink" 
                        frameborder="0" 
                        allowfullscreen>
                    </iframe>
                </template>

                <!-- Otherwise, display the image -->
                <template v-else>
                    <img :src="entry.imageUrl" :alt="entry.displayLines[2]" class="art-image" />
                </template>

                <p class="title-text">{{ entry.displayLines[2] }}</p>
                <p>{{ entry.date }}</p>
                <p>{{ entry.displayLines[4] }}</p>
                <p v-if="entry.displayLines[5]">{{ entry.displayLines[5] }}</p>
            </div>
        </main>
    </div>
</template>

<script>
const DATA_BUCKET_URL = import.meta.env.VITE_DATA_BUCKET_URL; // Load S3 URL from .env.local
export default {
    props: ["siteTitle", "siteSubtitle"], // Receives props from App.vue
    data() {
        return {
            artList: [],
            sortedArtList: [],
            availableTags: [],
            selectedTag: null,
            isCollapsed: false, // Controls the side menu collapse
        };
    }, 
    async created() {
        try {
            const response = await fetch(`${DATA_BUCKET_URL}/artfiles/artfiles.json`);
            if (!response.ok) throw new Error("Failed to fetch art list"); 
            
            const data = await response.json();
            console.log(`📡 Received data: \n\n${JSON.stringify(data)}`);
            this.artList = data; 
            this.sortedArtList = data; 

            // Extract and clean tags
            const tags = new Set();
            data.forEach((entry) => {
                entry.tags.split(",").forEach((tag) => {
                    tag = tag.trim();
                    if (tag.length > 0) {
                        tag = tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
                        tags.add(tag);
                    }
                });
            });

            this.availableTags = Array.from(tags);
        } catch (error) {
            console.error(error);
        }
    },
    methods: {
        sortByTag(tag) {
            this.selectedTag = tag;
            this.sortedArtList = this.artList.filter((entry) =>
                entry.tags.toLowerCase().includes(tag.toLowerCase())
            );
        },
        resetFilter() {
            this.selectedTag = null;
            this.sortedArtList = this.artList;
        }
    }
};
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