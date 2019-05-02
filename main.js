"use strict";

let app = new Vue({
  el: "#app",
  data: {
    status: "Ready.",
    url: "None.",
    deleteurl: "None.",
    alertType: "alert-success",
    copyBtnDisable: true
  },
  methods: {
    copyToClip: () => {
      let el = document.createElement("textarea");
      el.value = app.url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      app.status = "[OK] Copied to system clipboard.";
    }
  }
});

document.addEventListener("paste", event => {
  let blob;
  app.status = "Processing...";
  app.alertType = "alert-warning";
  app.copyBtnDisable = true;

  if (event.clipboardData || event.originalEvent) {
    let clipboardData =
      event.clipboardData || event.originalEvent.clipboardData;
    if (clipboardData.items) {
      for (let i = 0; i < clipboardData.items.length; i++) {
        if (clipboardData.items[i].type.indexOf("image") !== -1) {
          blob = clipboardData.items[i].getAsFile();
        }
      }
    }
  }
  let render = new FileReader();
  render.onload = event => {
    let base64 = event.target.result;
    document.getElementById("img").setAttribute("src", base64);
  };
  try {
    render.readAsDataURL(blob);
  } catch (error) {
    app.status = "[Error] Sorry, you didn't paste an image.";
    app.alertType = "alert-warning";
    return;
  }

  let formData = new FormData();
  formData.append("smfile", blob);

  axios
    .post("https://sm.ms/api/upload", formData)
    .then(response => {
      let r = response.data;
      if (r.code == "success") {
        app.status = "[OK] Upload finished.";
        app.alertType = "alert-success";
        app.url = `![](${r.data.url})`;
        app.deleteurl = `${r.data.delete}`;
        app.copyBtnDisable = false;
      } else {
        app.status = `[Error: ${r.msg}] Upload failed. `;
        app.alertType = "alert-danger";
      }
    })
    .catch(error => {
      app.status = `[Error: ${error}] Upload failed. `;
      app.alertType = "alert-danger";
    });
});
