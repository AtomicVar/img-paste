let app = new Vue({
  el: "#app",
  data: {
    status: "Ready.",
    url: "None.",
    alertType: "alert-success",
    copyBtnDisable: true
  },
  methods: {
    copyToClip: function() {
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

function updateProgress(e) {
  if (e.lengthComputable) {
    let percent = (e.loaded / e.total) * 100;
    app.status = `Upload: ${percent} %`;
    app.alertType = "alert-warning";
  } else {
    app.status = "Uploading";
    app.alertType = "alert-warning";
  }
}

function transferFailed(evt) {
  app.status = "[Error] Upload failed.";
  app.alertType = "alert-danger";
}

function transferCanceled(evt) {
  app.status = "[Warning] Upload cancelled.";
  app.alertType = "alert-warning";
}

document.addEventListener("paste", function(event) {
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
  render.onload = function(evt) {
    let base64 = evt.target.result;
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

  let request = new XMLHttpRequest();
  request.addEventListener("progress", updateProgress);
  request.addEventListener("error", transferFailed);
  request.addEventListener("abort", transferCanceled);

  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      r = JSON.parse(request.response);
      if (r.code == "success") {
        app.status = "[OK] Upload finished.";
        app.alertType = "alert-success";
        app.url = "![](" + r.data.url + ")";
        app.copyBtnDisable = false;
      } else {
        app.status = "[Error] Upload failed.";
        app.alertType = "alert-danger";
      }
    }
  };
  request.open("POST", "https://sm.ms/api/upload");
  request.send(formData);
});
