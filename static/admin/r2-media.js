// Custom R2 media library for Decap CMS.
// Follows the same init/show/hide/enableStandalone pattern as the
// official Cloudinary media library integration.

async function init({ options = {}, handleInsert } = {}) {
  const uploadUrl = options.upload_url || "";
  const publicUrl = options.public_url || "";

  return {
    show({ config: instanceConfig = {}, allowMultiple } = {}) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.multiple = allowMultiple || false;

      input.addEventListener("change", async () => {
        const files = Array.from(input.files || []);
        if (files.length === 0) return;

        const uploaded = [];
        for (const file of files) {
          const formData = new FormData();
          formData.append("file", file);

          try {
            const response = await fetch(`${uploadUrl}/upload`, {
              method: "POST",
              body: formData,
              credentials: "include",
            });

            if (response.ok) {
              const data = await response.json();
              uploaded.push(data.url);
            } else {
              console.error(`Upload failed for ${file.name}:`, await response.text());
            }
          } catch (err) {
            console.error(`Upload error for ${file.name}:`, err);
          }
        }

        if (uploaded.length > 0) {
          handleInsert(uploaded.length === 1 ? uploaded[0] : uploaded);
        }
      });

      input.click();
    },

    hide() {},

    enableStandalone() {
      return true;
    },
  };
}

const r2MediaLibrary = { name: "r2", init };

if (window.CMS) {
  window.CMS.registerMediaLibrary(r2MediaLibrary);
}
