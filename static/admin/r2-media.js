// Custom R2 media library for Decap CMS.
// Uploads files to the R2 upload Worker and lists existing files.

const R2MediaLibrary = {
  name: "r2",

  init({ options }) {
    this.uploadUrl = options.upload_url || "";
    this.publicUrl = options.public_url || "";
  },

  // Called when the media library UI is opened
  async show({ config, allowMultiple }) {
    this.uploadUrl = config?.upload_url || this.uploadUrl;
    this.publicUrl = config?.public_url || this.publicUrl;

    return new Promise((resolve) => {
      // Create a simple file picker dialog
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.multiple = allowMultiple || false;

      input.addEventListener("change", async () => {
        const files = Array.from(input.files || []);
        if (files.length === 0) {
          resolve([]);
          return;
        }

        const uploaded = [];
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch(`${this.uploadUrl}/upload`, {
            method: "POST",
            body: formData,
            credentials: "include",
          });

          if (response.ok) {
            const data = await response.json();
            uploaded.push({ url: data.url, path: data.url });
          } else {
            console.error(`Upload failed for ${file.name}:`, await response.text());
          }
        }

        resolve(uploaded.length === 1 ? uploaded[0] : uploaded);
      });

      input.addEventListener("cancel", () => resolve([]));
      input.click();
    });
  },

  // Called when Decap needs to enable/disable the insert button
  enableStandalone() {
    return true;
  },
};

if (window.CMS) {
  window.CMS.registerMediaLibrary(R2MediaLibrary);
}
