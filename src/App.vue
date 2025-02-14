<template>
  <div>
    <router-view :siteTitle="pageTitle" :siteSubtitle="pageSubtitle"></router-view> <!-- Displays current view -->
  </div>
</template>

<script>
const DATA_BUCKET_URL = import.meta.env.VITE_DATA_BUCKET_URL; // Load S3 URL from .env.local

export default {
  data() {
    return {
      pageTitle: "Loading...",
      pageSubtitle: "",
      pageFont: null
    };
  },
  watch: {
    // Watch for route changes and reload fonts/titles
    $route: "loadPageData",
    "$route.name": {
      immediate: true, // Run immediately when the component is created
      async handler(newViewName) {
        console.log("🔄 Route changed. New viewName:", newViewName);
        if (newViewName) {
          this.viewName = newViewName;
          await this.loadPageData();
        }
      }
    },
  },
  async created() {
    await this.loadPageData();
  },
  methods: {
    async loadPageData() {
      if (!this.viewName) {
        console.warn("⚠️ loadPageData called, but viewName is undefined.");
        return;
      }

      console.log(`📡 Fetching data for view: ${this.viewName}`);
      try {

        // Load h1.txt (Title)
        console.log(`📡 Fetching data from: ${DATA_BUCKET_URL}/fonts/${this.viewName}`)
        const h1Response = await fetch(`${DATA_BUCKET_URL}/fonts/${this.viewName}/h1.txt`);
        this.pageTitle = h1Response.ok ? await h1Response.text() : "Untitled";

        // Load h2.txt (Subtitle)
        const h2Response = await fetch(`${DATA_BUCKET_URL}/fonts/${this.viewName}/h2.txt`);
        this.pageSubtitle = h2Response.ok ? await h2Response.text() : "";

        // Load font (Assume single .otf file per view folder)
        const fontUrl = `${DATA_BUCKET_URL}/fonts/${this.viewName}/${this.viewName}.otf`;
        this.pageFont = fontUrl;
        const fontExists = await this.checkIfFileExists(fontUrl);

        if (fontExists) {
          this.applyFont(this.viewName, fontUrl);
        }else {
          console.warn(`⚠️ Font file not found: ${fontUrl}. Reverting to default font.`);
          this.resetToDefaultFont();
        }
        } catch (error) {
        if (error.name === "AbortError") {
          console.warn("⚠️ Fetch aborted due to rapid route change.");
        } else {
          console.error("🚨 Error loading page data:", error);
        }
      }
    },
    async checkIfFileExists(url) {
      try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
      } catch {
        return false;
      }
    },
    resetToDefaultFont() {
      const existingStyle = document.getElementById("dynamic-font");
      if (existingStyle) {
        existingStyle.remove(); // Remove dynamically loaded font
      }

      // Reset headings to the default font
      const style = document.createElement("style");
      style.id = "default-font";
      style.innerHTML = `
        h1, h2 {
          font-family: sans-serif; /* Or whatever default font you prefer */
        }`;
      document.head.appendChild(style);
    },

    applyFont(viewName, fontUrl) {
      // Remove previous font styles
      const existingStyle = document.getElementById("dynamic-font");
      if (existingStyle) {
        existingStyle.remove();
      }

      // Create a new style element
      const style = document.createElement("style");
      style.id = "dynamic-font";
      style.innerHTML = `
        @font-face {
          font-family: '${viewName}Font';
          src: url('${fontUrl}') format('opentype');
        }
        h1, h2 {
          font-family: '${viewName}Font', sans-serif;
        }
      `;
      document.head.appendChild(style);
    }
  }
};
</script>

<style>
/* Global styles */
h1 {
  font-weight: bold;
  font-size: 3.6rem;
  color: #000000;
  align-items: left;

}

h2 {
  font-size: 1.6rem;
  align-items: left;
  padding-left: 10px;
  padding-bottom: 5px;

}
body,
html {
  background-color: #f8f8f8;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  color: #444444;
  display: flex;
  justify-content: center;
}

.title-text {
  color: #000000;
}

/* Layout container */
.layout {
  display: flex;
  width: 100%;
  max-width: 1400px;
  flex-direction: column;
}

/* Left-side menu */
.side-menu {
  width: 300px;
  /* Fixed width */
  min-height: 100vh;
  /* Full screen height */
  padding: 20px;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
}

/* Sorting Buttons */
.sort-buttons {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* General button styling */
.sort-button, 
.sort-buttons button {
  background-color: transparent;
  color: #444; /* Dark gray text */
  border: none;
  padding: 10px;
  cursor: pointer;
  text-align: left;
  font-size: 1rem;
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  text-decoration: none; /* Removes underline from router-link */
  display: block;
  width: 100%;
}

/* Hover effect */
.sort-button:hover, 
.sort-buttons button:hover {
  background-color: #444; /* Dark gray */
  color: white;
}

/* Active button (when selected) */
.sort-button.active, 
.sort-buttons button.active {
  background-color: black !important;
  color: white !important;
  font-weight: bold;
}

/* Ensure the About button follows the same style */
.about-button {
  display: block;
  width: 100%;
  text-align: left;
}

/* Encompases one whole art*/
.art-entry {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  width: 60vw;
  max-width: 1400px;
  margin: 140px auto;
  /* Adds breathing room: 60px top and bottom */
  padding: 20px 0;
  /* Adds internal spacing */
}

/* Youtube specific art entry */
.media-content {
  width: 60vw;
  max-width: 1400px; 
  margin: 140px auto;
  aspect-ratio: 16 / 9;
  padding: 20px 0;
  height: auto;
  display: block;
}

/* Main content area */
.content {
  margin-left: 160px;
  /* Leaves space for the menu */
  width: 100%;
  padding: 20px;
}

/* Image styling */
.art-image {
  max-width: 1200px;
  width: 80%;
  height: auto;
  display: block;
  margin: 0 auto 10px auto;
  margin-left: 0px;
}

.art-entry p {
  text-align: left;
  width: 70%;
  /* Match image width */
  max-width: 1000px;
  margin-right: auto;
  /* Prevents text from stretching too far */

}

/* Divider Styling */
.divider {
  border: none;
  height: 1px;
  background-color: #ddd; /* Light gray */
  margin: 15px 0; /* Space around the divider */
  width: 100%; /* Slightly shorter than full width */
  align-self: center;
}

/* Mobile adjustments */
@media (min-width: 1024px){
  /* Toggle Button */
.toggle-button {
    display:none;
  }
}
@media (max-width: 1024px) {
  .layout {
    flex-direction: column;
  }

  .side-menu {
    width: 100%;

    min-height: 20vh;
    position: relative;
    box-shadow: none;
  }

  .content {
    margin-left: 0;
  }

  .art-image {
    width: 100%;
  }
}
</style>